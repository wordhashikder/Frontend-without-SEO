"use client";

import { useActionState } from "react";
import { type AuthState, resendVerification } from "@/actions/auth";
import { describedBy, Field, FormMessage, Input } from "@/components/ui/form";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = { ok: false };

type ResendVerificationProps = {
  /** Known address: sent as a hidden field. Otherwise the visitor types it. */
  email?: string;
  /** Prefix for element ids, so two instances can share a page. */
  id?: string;
  variant?: "outline" | "primary";
};

/** "Resend verification email" button, with an email field when needed. */
export function ResendVerification({
  email,
  id = "resend",
  variant = "outline",
}: ResendVerificationProps) {
  const [state, action] = useActionState(resendVerification, initialState);
  const emailError = state.fieldErrors?.email;

  return (
    <form action={action} className="space-y-4">
      {email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <Field label="Email address" htmlFor={`${id}-email`} error={emailError}>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="you@yourbusiness.co.uk"
            {...describedBy(`${id}-email`, emailError)}
          />
        </Field>
      )}
      {state.message ? (
        <FormMessage tone={state.ok ? "success" : "error"}>
          {state.message}
        </FormMessage>
      ) : null}
      <SubmitButton variant={variant} fullWidth pendingLabel="Sending…">
        Resend verification email
      </SubmitButton>
    </form>
  );
}
