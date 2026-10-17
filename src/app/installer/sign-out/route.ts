import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { publicUrl } from "@/lib/public-url";
import { clearSession, getRefreshToken } from "@/lib/session";
import { routes } from "@/lib/site";

/*
 * Ends the installer's website session, then shows the sign-in page. The
 * Dashboard sends installers here when they sign out there, so one sign-out
 * really signs them out of both (the two apps keep separate sessions).
 * Signing out is safe to repeat and only ever signs the visitor out.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await api.logout(refreshToken);
    } catch {
      // The cookies are removed below either way, which signs this browser out.
    }
  }
  await clearSession();
  const response = NextResponse.redirect(
    publicUrl(`${routes.login}?signed_out=1`, request),
    303,
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
