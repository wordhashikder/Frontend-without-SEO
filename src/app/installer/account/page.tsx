import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountOverview } from "@/components/account/account-overview";
import { ApiError, api } from "@/lib/api";
import { getPlans } from "@/lib/plans";
import { pageMetadata } from "@/lib/seo";
import {
  getAccessToken,
  getCurrentUser,
  getRefreshToken,
  loginPath,
} from "@/lib/session";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Your Installer Account",
  description:
    "Your PickASparky installer account: see whether your listing is live, check your membership plan and manage billing securely through Stripe.",
  path: routes.account,
  index: false,
});

// Dynamic by nature: every request reads the session cookies.
export default async function AccountPage({
  searchParams,
}: PageProps<"/installer/account">) {
  const { checkout, session_id: sessionId } = await searchParams;
  if (
    checkout === "success" &&
    typeof sessionId === "string" &&
    /^cs_[A-Za-z0-9_]+$/.test(sessionId)
  ) {
    // Back from Stripe: confirm the payment now, so the plan is active the moment they
    // arrive (the webhook does the same; this also covers it being a little late). It runs
    // before the user is loaded below so that page shows the new plan.
    const token = await getAccessToken();
    if (token) {
      try {
        await api.checkoutStatus(token, sessionId);
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;
      }
    }
  }

  // The proxy only pre-filters. This is the check that guards the page.
  const user = await getCurrentUser();
  if (!user) {
    // A refresh token but no access token means the proxy could not reach
    // the API to renew the session: report a problem rather than ask an
    // installer who is still signed in for their password.
    if (!(await getAccessToken()) && (await getRefreshToken())) {
      throw new Error("Session refresh unavailable");
    }
    redirect(loginPath(routes.account));
  }

  const plans = await getPlans();
  return (
    <AccountOverview
      user={user}
      plans={plans}
      checkout={typeof checkout === "string" ? checkout : undefined}
    />
  );
}
