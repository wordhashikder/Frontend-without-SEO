"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { type AuthState, verifyEmail } from "@/actions/auth";
import { ButtonLink } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { IconBadge } from "@/components/ui/icon-badge";
import { routes } from "@/lib/site";
import { textLink } from "./auth-card";
import { ResendVerification } from "./resend-verification";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = { ok: false };

/**
 * Verification is a state change, so it happens on a button press (POST),
 * never on page load: mail scanners that pre-fetch links must not use up
 * the token.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action] = useActionState(verifyEmail, initialState);

  if (state.ok) {
    return (
      <div className="space-y-6">
        <div role="status" className="flex gap-4">
          <IconBadge icon={CircleCheck} tone="green" size="sm" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold text-ink">Email verified</p>
            <p className="mt-1">
              Thanks for confirming your address. Sign in to see the status of
              your listing.
            </p>
          </div>
        </div>
        <ButtonLink
          href={`${routes.login}?verified=1`}
          size="lg"
          fullWidth
          arrow
        >
          Sign in
        </ButtonLink>
      </div>
    );
  }

  if (state.code === "invalid_token") {
    return <ExpiredLink message={state.message} />;
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      {state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      <SubmitButton size="lg" fullWidth arrow pendingLabel="Verifying…">
        Verify my email
      </SubmitButton>
    </form>
  );
}

/** Shown for a missing, used or expired link: offer a fresh one. */
export function ExpiredLink({ message }: { message?: string }) {
  return (
    <div className="space-y-5">
      <FormMessage tone="error">
        {message ?? "This verification link is invalid or has expired."}
      </FormMessage>
      <p className="text-sm leading-relaxed">
        Verification links can only be used once and expire after a while. Enter
        the email address you signed up with and we&apos;ll send a new one. If
        you&apos;ve already verified your email, you can{" "}
        <Link href={routes.login} className={textLink}>
          sign in
        </Link>
        .
      </p>
      <ResendVerification id="verify-resend" variant="primary" />
    </div>
  );
}
