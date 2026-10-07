import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, textLink } from "@/components/auth/auth-card";
import {
  ExpiredLink,
  VerifyEmailForm,
} from "@/components/auth/verify-email-form";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Verify Your Email Address",
    description:
      "Confirm the email address for your PickASparky installer account so we can start reviewing your business details and get your listing ready.",
    path: "/installer/verify-email",
    index: false,
  }),
  // The address carries a one-time token: never send it on as a referrer.
  referrer: "no-referrer",
};

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/installer/verify-email">) {
  const { token } = await searchParams;
  const hasToken = typeof token === "string" && token.length > 0;

  return (
    <AuthCard
      title="Verify your email address"
      lead={
        hasToken
          ? "One last step: confirm this is your email address so we can start reviewing your business details."
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
        <VerifyEmailForm token={token} />
      ) : (
        <ExpiredLink message="This verification link is incomplete." />
      )}
    </AuthCard>
  );
}
