import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, api } from "@/lib/api";
import {
  ACCESS_COOKIE,
  accessCookieOptions,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from "@/lib/session-cookies";
import { routes } from "@/lib/site";
import type { CurrentUser, TokenPair } from "@/lib/types";

/*
 * Installer session, backend-for-frontend style: the API's tokens live in
 * httpOnly cookies on this origin and never reach client components. Cookies
 * can only be written from Server Actions, Route Handlers or the proxy.
 */

/** Store a freshly issued token pair. Server Actions only. */
export async function setSession(tokens: TokenPair) {
  const store = await cookies();
  store.set(
    ACCESS_COOKIE,
    tokens.access_token,
    accessCookieOptions(tokens.expires_in),
  );
  store.set(REFRESH_COOKIE, tokens.refresh_token, refreshCookieOptions());
}

/** Remove both session cookies. Server Actions only. */
export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value || undefined;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value || undefined;
}

/**
 * The signed-in user, verified by the API on every request, or `null` when
 * there is no valid session. Memoised so one render makes one API call.
 * An unreachable API throws: an outage must not look like being signed out.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await api.me(token);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return null;
    }
    throw error;
  }
});

/** Where to send someone who must sign in before seeing `next`. */
export const loginPath = (next: string = routes.account) =>
  `${routes.login}?next=${encodeURIComponent(next)}`;

/**
 * Authorisation check for Server Actions and protected pages: returns the
 * access token and the user it belongs to, or redirects to the login page.
 */
export async function requireSession(next: string = routes.account) {
  const [token, user] = await Promise.all([getAccessToken(), getCurrentUser()]);
  if (!token || !user) redirect(loginPath(next));
  return { token, user };
}
