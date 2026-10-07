import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  accessCookieOptions,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from "@/lib/session-cookies";
import { routes } from "@/lib/site";

/*
 * Keeps an installer signed in. The access token lasts minutes and the
 * refresh token weeks, and a page render cannot write cookies, so the token
 * pair is rotated here, before the account route runs.
 *
 * This is an optimistic gate only. The account page and every Server Action
 * verify the session with the API themselves.
 */

const API_URL = (process.env.API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

type Tokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};
/** `rejected`: the API refused the token. `unavailable`: the API is down. */
type RefreshResult = Tokens | "rejected" | "unavailable";

async function requestRefresh(refreshToken: string): Promise<RefreshResult> {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if ([400, 401, 403, 422].includes(response.status)) return "rejected";
    if (!response.ok) return "unavailable";
    const body = (await response.json()) as Partial<Tokens> | null;
    if (
      typeof body?.access_token !== "string" ||
      typeof body.refresh_token !== "string" ||
      typeof body.expires_in !== "number"
    ) {
      return "unavailable";
    }
    return {
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      expires_in: body.expires_in,
    };
  } catch {
    return "unavailable";
  }
}

/*
 * Refresh tokens are single-use: presenting one twice makes the API revoke
 * the whole session. Two requests arriving together (two tabs, a double
 * click) therefore share one refresh call, and its result is kept for a few
 * seconds until the browser has stored the new cookies.
 */
const recentRefreshes = new Map<string, Promise<RefreshResult>>();
const REFRESH_GRACE_MS = 10_000;

function refreshOnce(refreshToken: string) {
  let pending = recentRefreshes.get(refreshToken);
  if (!pending) {
    pending = requestRefresh(refreshToken);
    recentRefreshes.set(refreshToken, pending);
    const forget = () => recentRefreshes.delete(refreshToken);
    pending.then((result) => {
      // An outage is not worth remembering: let the next request try again.
      if (result === "unavailable") forget();
      else setTimeout(forget, REFRESH_GRACE_MS).unref?.();
    });
  }
  return pending;
}

function redirectToLogin(request: NextRequest) {
  const login = new URL(routes.login, request.url);
  login.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(login);
}

export async function proxy(request: NextRequest) {
  if (request.cookies.get(ACCESS_COOKIE)?.value) return NextResponse.next();

  // Server Actions post to this route. They are never redirected from here:
  // each action checks the session and answers with its own redirect.
  const isPageRequest = request.method === "GET" || request.method === "HEAD";
  const signedOut = () =>
    isPageRequest ? redirectToLogin(request) : NextResponse.next();

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return signedOut();

  const result = await refreshOnce(refreshToken);

  // API unreachable: keep the session and let the route report the problem.
  if (result === "unavailable") return NextResponse.next();

  if (result === "rejected") {
    const response = signedOut();
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  // Forward the new tokens to the route on the request, and store them in
  // the browser on the response.
  request.cookies.set(ACCESS_COOKIE, result.access_token);
  request.cookies.set(REFRESH_COOKIE, result.refresh_token);
  const response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });
  response.cookies.set(
    ACCESS_COOKIE,
    result.access_token,
    accessCookieOptions(result.expires_in),
  );
  response.cookies.set(
    REFRESH_COOKIE,
    result.refresh_token,
    refreshCookieOptions(),
  );
  return response;
}

export const config = {
  matcher: ["/installer/account/:path*"],
};
