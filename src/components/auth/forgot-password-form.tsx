"use client";

import { MailCheck } from "lucide-react";
import { useActionState } from "react";
import { type AuthState, requestPasswordReset } from "@/actions/auth";
import { describedBy, Field, FormMessage, Input } from "@/components/ui/form";
import { IconBadge } from "@/components/ui/icon-badge";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = { ok: false };

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialState);
  const emailError = state.fieldErrors?.email;

  if (state.ok) {
    return (
      <div role="status" className="flex gap-4">
        <IconBadge icon={MailCheck} tone="green" size="sm" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-ink">Check your inbox</p>
          <p className="mt-1">
            If there&apos;s an account for{" "}
            <span className="break-all font-medium text-ink">
              {state.values?.email}
            </span>
            , we&apos;ve sent a link to choose a new password. It can take a few
            minutes to arrive, and it&apos;s worth checking your spam folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      <Field label="Email address" htmlFor="forgot-email" error={emailError}>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.values?.email}
          placeholder="you@yourbusiness.co.uk"
          {...describedBy("forgot-email", emailError)}
        />
      </Field>
      <SubmitButton size="lg" fullWidth arrow pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
