"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type AuthState, login } from "@/actions/auth";
import { describedBy, Field, FormMessage, Input } from "@/components/ui/form";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";
import { textLink } from "./auth-card";
import { PasswordField } from "./password-field";
import { ResendVerification } from "./resend-verification";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = { ok: false };

/** Email + password sign-in. `next` is re-validated by the Server Action. */
export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, initialState);
  const emailError = state.fieldErrors?.email;
  const unverified = state.code === "email_not_verified";

  return (
    <div className="space-y-5">
      {state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}

      {unverified && state.values?.email ? (
        <ResendVerification email={state.values.email} id="login-resend" />
      ) : null}

      <form action={action} className="space-y-5">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Field label="Email address" htmlFor="login-email" error={emailError}>
          <Input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={state.values?.email}
            placeholder="you@yourbusiness.co.uk"
            {...describedBy("login-email", emailError)}
          />
        </Field>
        <div>
          <PasswordField
            id="login-password"
            label="Password"
            mode="current"
            error={state.fieldErrors?.password}
          />
          <p className="text-right text-[13px]">
            <Link
              href={routes.forgotPassword}
              className={cn(textLink, "inline-block py-2.5")}
            >
              Forgot password?
            </Link>
          </p>
        </div>
        <SubmitButton size="lg" fullWidth arrow pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>
    </div>
  );
}
