import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountOverview } from "@/components/account/account-overview";
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

  const { checkout } = await searchParams;
  return (
    <AccountOverview
      user={user}
      checkout={typeof checkout === "string" ? checkout : undefined}
    />
  );
}
