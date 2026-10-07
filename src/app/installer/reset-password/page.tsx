import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, textLink } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ButtonLink } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Choose a New Installer Password",
    description:
      "Choose a new password for your PickASparky installer account using the secure link we emailed you, then sign in to manage your listing.",
    path: "/installer/reset-password",
    index: false,
  }),
  // The address carries a one-time token: never send it on as a referrer.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/installer/reset-password">) {
  const { token } = await searchParams;
  const hasToken = typeof token === "string" && token.length > 0;

  return (
    <AuthCard
      title="Choose a new password"
      lead={
        hasToken
          ? "Pick a password you don't use anywhere else. You'll be signed out on your other devices."
          : undefined
      }
      footer={
        <p>
          <Link href={routes.login} className={textLink}>
            Back to sign in
          </Link>
        </p>
      }
    >
      {hasToken ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-5">
          <FormMessage tone="error">
            This password reset link is incomplete.
          </FormMessage>
          <p className="text-sm leading-relaxed">
            Open the link from your email again, or request a new one.
          </p>
          <ButtonLink href={routes.forgotPassword} size="lg" fullWidth arrow>
            Request a new link
          </ButtonLink>
        </div>
      )}
    </AuthCard>
  );
}
