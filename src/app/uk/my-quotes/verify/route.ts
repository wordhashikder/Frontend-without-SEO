import { type NextRequest, NextResponse } from "next/server";
import { ApiError, api } from "@/lib/api";
import { setCustomerSession } from "@/lib/customer-session";
import { getClientIp } from "@/lib/request";

/*
 * The emailed magic link lands here. The one-time token is exchanged for a
 * session, stored in an httpOnly cookie, and the visitor is sent on to their
 * dashboard with the token no longer in the address bar.
 */

export const dynamic = "force-dynamic";

const DASHBOARD = "/uk/my-quotes/";

function redirectTo(request: NextRequest, search = "") {
  const response = NextResponse.redirect(
    new URL(`${DASHBOARD}${search}`, request.url),
    303,
  );
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
    return redirectTo(request, "?link=invalid");
  }
  return redirectTo(request);
}
