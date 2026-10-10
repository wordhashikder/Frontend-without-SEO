"use client";

import { Building2, ChevronDown } from "lucide-react";
import { useActionState, useId } from "react";
import { type ClaimState, requestClaim } from "@/actions/claim";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field, FormMessage, Input } from "@/components/ui/form";

const initialState: ClaimState = { ok: false };

/**
 * "Is this your business?": shown on free listings PickASparky added that
 * nobody has claimed yet. A native <details> disclosure, so it works before
 * JavaScript loads and stays out of the way of homeowners.
 */
export function ClaimListing({
  slug,
  businessName,
}: {
  slug: string;
  businessName: string;
}) {
  const [state, action] = useActionState(requestClaim, initialState);
  const id = useId();

  return (
    <details className="group mt-4 rounded-xl border border-line bg-white shadow-soft">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm [&::-webkit-details-marker]:hidden">
        <Building2
          aria-hidden
          className="size-5 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        <span className="flex-1">
          <span className="font-semibold text-ink">Is this your business?</span>{" "}
          Claim this listing for free.
        </span>
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-line px-5 pt-4 pb-5">
        {state.ok ? (
          <FormMessage tone="success">{state.message}</FormMessage>
        ) : (
          <form action={action} className="space-y-4" noValidate>
            <input type="hidden" name="slug" value={slug} />
            <p className="text-[13px] leading-relaxed">
              Enter the email address {businessName} uses. If it matches our
              records we&apos;ll email you a link to manage the listing;
              otherwise our team will check and get back to you.
            </p>
            {state.message ? (
              <FormMessage tone="error">{state.message}</FormMessage>
            ) : null}
            <Field
              label="Business email"
              htmlFor={`${id}-email`}
              error={state.fieldErrors?.email}
            >
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                defaultValue={state.values?.email}
              />
            </Field>
            <SubmitButton fullWidth pendingLabel="Sending…">
              Send me a claim link
            </SubmitButton>
          </form>
        )}
      </div>
    </details>
  );
}
