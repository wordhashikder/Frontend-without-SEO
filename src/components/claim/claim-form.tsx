"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type ClaimState, claimListing } from "@/actions/claim";
import { textLink } from "@/components/auth/auth-card";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { ButtonLink } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { routes, site } from "@/lib/site";

const initialState: ClaimState = { ok: false };

/** Set a password and take over a free listing. The token travels in a hidden field. */
export function ClaimForm({ token, email }: { token: string; email: string }) {
  const [state, action] = useActionState(claimListing, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.code === "already_claimed") {
    return (
      <div className="space-y-5">
        <FormMessage tone="error">{state.message}</FormMessage>
        <ButtonLink href={routes.login} size="lg" fullWidth arrow>
          Sign in
        </ButtonLink>
      </div>
    );
  }
  if (state.code === "invalid_token") {
    return (
      <div className="space-y-5">
        <FormMessage tone="error">{state.message}</FormMessage>
        <p className="text-sm leading-relaxed">
          Claim links expire after 72 hours. Ask for a new one from your
          listing, or email{" "}
          <a href={`mailto:${site.email}`} className={textLink}>
            {site.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      {state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      <div>
        <p className="text-sm font-medium text-ink">Your sign-in email</p>
        <p className="mt-1 rounded-md border border-line bg-surface px-4 py-3 text-sm">
          {email}
        </p>
      </div>
      <PasswordField
        id="claim-password"
        label="Choose a password"
        mode="new"
        error={errors.password}
      />
      <div>
        <label
          htmlFor="accept_terms"
          className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"
        >
          <input
            id="accept_terms"
            type="checkbox"
            name="accept_terms"
            required
            aria-invalid={errors.accept_terms ? true : undefined}
            aria-describedby={
              errors.accept_terms ? "accept_terms-error" : undefined
            }
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-line accent-primary"
          />
          <span>
            I run this business and agree to the{" "}
            <Link
              href={routes.terms}
              target="_blank"
              rel="noopener"
              className={textLink}
            >
              Terms &amp; Conditions
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>{" "}
            and{" "}
            <Link
              href={routes.privacy}
              target="_blank"
              rel="noopener"
              className={textLink}
            >
              Privacy Policy
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
            .
          </span>
        </label>
        {errors.accept_terms ? (
          <p
            id="accept_terms-error"
            role="alert"
            className="mt-1.5 text-xs text-red-600"
          >
            {errors.accept_terms}
          </p>
        ) : null}
      </div>
      <SubmitButton size="lg" fullWidth arrow pendingLabel="Claiming…">
        Claim my listing
      </SubmitButton>
    </form>
  );
}
