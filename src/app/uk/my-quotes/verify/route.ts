import { type NextRequest, NextResponse } from "next/server";
import { ApiError, api } from "@/lib/api";
import { getCustomerSession, setCustomerSession } from "@/lib/customer-session";
import { publicUrl } from "@/lib/public-url";
import { getClientIp } from "@/lib/request";

/*
 * The emailed magic link lands here. The one-time token is exchanged for a
 * session, stored in an httpOnly cookie, and the visitor is sent on to their
 * dashboard with the token no longer in the address bar.
 *
 * Links in "new message / new quote" emails also carry `next`, the page to open
 * (that conversation). Only a plain path inside the dashboard is followed.
 */

export const dynamic = "force-dynamic";

const DASHBOARD = "/uk/my-quotes/";
// A path inside the dashboard, with at most a query: no scheme, host or "//".
const SAFE_NEXT = /^\/uk\/my-quotes\/[A-Za-z0-9\-_/]*(\?[A-Za-z0-9\-_=&%.]*)?$/;

function destination(request: NextRequest): string {
  const next = request.nextUrl.searchParams.get("next")?.trim() ?? "";
  return next.length <= 200 && SAFE_NEXT.test(next) ? next : DASHBOARD;
}

function redirectTo(request: NextRequest, search = "") {
  const target = search === "" ? destination(request) : `${DASHBOARD}${search}`;
  const response = NextResponse.redirect(publicUrl(target, request), 303);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  if (!token || token.length > 512) return redirectTo(request, "?link=invalid");
  try {
    const session = await api.customerVerify(token, await getClientIp());
    await setCustomerSession(session.session_token, session.expires_in);
  } catch (error) {
    if (error instanceof ApiError && error.status >= 500) {
      return redirectTo(request, "?link=unavailable");
    }
    if (error instanceof ApiError && error.status === 429) {
      return redirectTo(request, "?link=busy");
    }
    // An old email button, opened again after its one-time link was used: if they are
    // still signed in, carry on to the page they wanted rather than asking for a new link.
    if (await getCustomerSession()) return redirectTo(request);
    return redirectTo(request, "?link=invalid");
  }
  return redirectTo(request);
}
