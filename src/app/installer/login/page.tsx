import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, textLink } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { FormMessage } from "@/components/ui/form";
import { pageMetadata } from "@/lib/seo";
import { getAccessToken, getCurrentUser, getRefreshToken } from "@/lib/session";
import { safeNextPath } from "@/lib/session-cookies";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Installer Login",
  description:
    "Sign in to your PickASparky installer account to check the status of your listing and manage your membership plan and billing.",
  path: routes.login,
  index: false,
});

const notices = {
  reset: "Your password has been changed. Sign in with your new password.",
  verified: "Your email address is verified. Sign in to continue.",
  signedOut: "You've been signed out.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/installer/login">) {
  const query = await searchParams;
  // Only same-site paths survive (open-redirect protection).
  const next = safeNextPath(query.next);

  // Already signed in: skip the form. An unreachable API just shows the form.
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(next ?? routes.account);

  // A refresh token without an access token can be renewed, but only by the
  // proxy in front of the account page. Skipped when the proxy sent us here
  // (it always sets `next`), so the two can never bounce a visitor forever.
  if (
    query.next === undefined &&
    !(await getAccessToken()) &&
    (await getRefreshToken())
  ) {
    redirect(routes.account);
  }

  const notice =
    query.reset === "success"
      ? notices.reset
      : query.verified === "1"
        ? notices.verified
        : query.signed_out === "1"
          ? notices.signedOut
          : null;

  return (
    <AuthCard
      title="Sign in to your account"
      lead="Check the status of your listing and manage your membership."
      footer={
        <p>
          New to PickASparky?{" "}
          <Link href={routes.join} className={textLink}>
            Join as an installer
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        {notice ? <FormMessage tone="success">{notice}</FormMessage> : null}
        <LoginForm next={next} />
      </div>
    </AuthCard>
  );
}
