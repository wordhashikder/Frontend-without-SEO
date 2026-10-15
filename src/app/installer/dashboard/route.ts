import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { publicUrl } from "@/lib/public-url";
import { getClientIp } from "@/lib/request";
import { getAccessToken, loginPath } from "@/lib/session";
import { routes } from "@/lib/site";

/*
 * "Open my dashboard". The Dashboard is its own app with its own session, so a
 * sign-in on this site is carried across with a one-minute, one-time code the
 * API issues for the signed-in installer: no second login, and no password or
 * long-lived token ever travels in a URL. The proxy renews an expired access
 * token before this runs. If anything goes wrong the installer still lands on
 * their account page (billing and listing status) rather than an error.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.redirect(
      publicUrl(loginPath(routes.dashboard), request),
    );
  }
  try {
    const { url } = await api.dashboardHandoff(token, await getClientIp());
    const response = NextResponse.redirect(url, 303);
    // The address carries a secret code: never cache it or leak it in a referrer.
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch {
    return NextResponse.redirect(publicUrl(routes.account, request));
  }
}
