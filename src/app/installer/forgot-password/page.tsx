import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, textLink } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Reset Your Installer Password",
  description:
    "Forgotten your PickASparky installer password? Enter the email address for your account and we'll send you a secure link to choose a new one.",
  path: routes.forgotPassword,
  index: false,
});

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      lead="Enter the email address for your installer account and we'll send you a link to choose a new password."
      footer={
        <p>
          Remembered it?{" "}
          <Link href={routes.login} className={textLink}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
