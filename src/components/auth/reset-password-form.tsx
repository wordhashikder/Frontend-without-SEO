"use client";

import { useActionState } from "react";
import { type AuthState, resetPassword } from "@/actions/auth";
import { ButtonLink } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { routes } from "@/lib/site";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = { ok: false };

/** Choose a new password. The token from the email travels in a hidden field. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, initialState);

  if (state.code === "invalid_token") {
    return (
      <div className="space-y-5">
        <FormMessage tone="error">{state.message}</FormMessage>
        <p className="text-sm leading-relaxed">
          Reset links can only be used once and expire after a short time.
          Request a new one and we&apos;ll email it to you.
        </p>
        <ButtonLink href={routes.forgotPassword} size="lg" fullWidth arrow>
          Request a new link
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      {state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      <PasswordField
        id="reset-password"
        label="New password"
        mode="new"
        error={state.fieldErrors?.password}
      />
      <SubmitButton size="lg" fullWidth arrow pendingLabel="Saving…">
        Save new password
      </SubmitButton>
    </form>
  );
}
