"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { type AuthState, register } from "@/actions/auth";
import {
  describedBy,
  Field,
  FormMessage,
  Honeypot,
  Input,
} from "@/components/ui/form";
import { IconBadge } from "@/components/ui/icon-badge";
import { Eyebrow } from "@/components/ui/layout";
import { plans } from "@/content/plans";
import { routes } from "@/lib/site";
import type { Plan } from "@/lib/types";
import { cn, UK_POSTCODE_PATTERN } from "@/lib/utils";
import { textLink } from "./auth-card";
import { PasswordField } from "./password-field";
import { ResendVerification } from "./resend-verification";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = { ok: false };

/**
 * Element id of a plan radio: plan-free, plan-pro, plan-premium. The summary
 * beside the form (join/register/page.tsx) shows the matching plan with CSS
 * `:has(#plan-pro:checked)`, so keep the two in step.
 */
const planInputId = (plan: Plan) => `plan-${plan}`;

/**
 * Installer sign-up. Field names match the API's register payload so its
 * validation errors map straight back onto the inputs.
 */
export function RegisterForm({ initialPlan }: { initialPlan: Plan }) {
  const [state, action] = useActionState(register, initialState);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  const selectedPlan = values.plan || initialPlan;

  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    // Move focus to the outcome: the confirmation, or the first field to fix.
    if (state.ok) heading.current?.focus();
    else if (state.fieldErrors) {
      form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
  }, [state]);

  if (state.ok) {
    return (
      <div>
        <IconBadge icon={MailCheck} tone="green" />
        <h1
          ref={heading}
          tabIndex={-1}
          className="mt-5 text-[26px] font-extrabold leading-tight tracking-[-0.02em] outline-none sm:text-[28px]"
        >
          Check your inbox
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed">
          We&apos;ve sent a verification link to{" "}
          <span className="break-all font-semibold text-ink">
            {values.email}
          </span>
          . Open it to confirm your email address, then sign in to see the
          status of your listing.
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          It can take a few minutes to arrive, and it&apos;s worth checking your
          spam folder. Still nothing? We can send it again.
        </p>
        <div className="mt-6 max-w-sm">
          <ResendVerification email={values.email} id="register-resend" />
        </div>
        <p className="mt-6 text-sm">
          Already verified?{" "}
          <Link href={routes.login} className={textLink}>
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow className="mb-2">Join as an installer</Eyebrow>
      <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[32px]">
        Create your installer account
      </h1>
      <p className="mt-3 text-sm leading-relaxed">
        Already have an account?{" "}
        <Link href={routes.login} className={textLink}>
          Sign in
        </Link>
      </p>

      <form ref={form} action={action} className="relative mt-7 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Business name"
            htmlFor="business_name"
            error={errors.business_name}
          >
            <Input
              id="business_name"
              name="business_name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="organization"
              defaultValue={values.business_name}
              placeholder="Your trading name"
              {...describedBy("business_name", errors.business_name)}
            />
          </Field>
          <Field
            label="Your name"
            htmlFor="contact_name"
            error={errors.contact_name}
          >
            <Input
              id="contact_name"
              name="contact_name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              defaultValue={values.contact_name}
              placeholder="First and last name"
              {...describedBy("contact_name", errors.contact_name)}
            />
          </Field>
        </div>

        <Field label="Email address" htmlFor="email" error={errors.email}>
          {/* `username` tells password managers this is the sign-in identifier. */}
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={values.email}
            placeholder="you@yourbusiness.co.uk"
            {...describedBy("email", errors.email)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone number" htmlFor="phone" error={errors.phone}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              maxLength={20}
              autoComplete="tel"
              inputMode="tel"
              defaultValue={values.phone}
              placeholder="07700 900123"
              {...describedBy("phone", errors.phone)}
            />
          </Field>
          <Field
            label="Business postcode"
            htmlFor="postcode"
            error={errors.postcode}
          >
            <Input
              id="postcode"
              name="postcode"
              type="text"
              required
              maxLength={8}
              pattern={UK_POSTCODE_PATTERN}
              title="Enter a full UK postcode, for example M1 1AA"
              autoComplete="postal-code"
              autoCapitalize="characters"
              spellCheck={false}
              defaultValue={values.postcode}
              placeholder="M1 1AA"
              className="uppercase placeholder:normal-case"
              {...describedBy("postcode", errors.postcode)}
            />
          </Field>
        </div>

        <PasswordField
          id="password"
          label="Password"
          mode="new"
          error={errors.password}
        />

        <fieldset
          aria-describedby={errors.plan ? "plan-error" : undefined}
          className="min-w-0"
        >
          <legend className="mb-2 block text-sm font-semibold text-ink">
            Membership plan
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map((plan) => (
              <label
                key={plan.key}
                htmlFor={planInputId(plan.key)}
                className={cn(
                  "flex min-h-[60px] cursor-pointer items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 transition-colors",
                  "hover:border-ink/30 has-[:checked]:border-primary has-[:checked]:bg-primary-soft/50",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                )}
              >
                <input
                  id={planInputId(plan.key)}
                  type="radio"
                  name="plan"
                  value={plan.key}
                  required
                  defaultChecked={plan.key === selectedPlan}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="size-[18px] shrink-0 rounded-full border border-subtle bg-white peer-checked:border-[5px] peer-checked:border-primary"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    {plan.name}
                  </span>
                  <span className="block text-[13px]">£{plan.price}/month</span>
                </span>
              </label>
            ))}
          </div>
          {errors.plan ? (
            <p
              id="plan-error"
              role="alert"
              className="mt-1.5 text-xs text-red-600"
            >
              {errors.plan}
            </p>
          ) : null}
        </fieldset>

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
              defaultChecked={values.accept_terms === "on"}
              aria-invalid={errors.accept_terms ? true : undefined}
              aria-describedby={
                errors.accept_terms ? "accept_terms-error" : undefined
              }
              className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-line accent-primary"
            />
            <span>
              I agree to the{" "}
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

        <Honeypot />

        {/* Beside the button, so it is in view after a long form is submitted. */}
        {state.message ? (
          <FormMessage tone="error">{state.message}</FormMessage>
        ) : null}

        <SubmitButton
          size="lg"
          fullWidth
          arrow
          pendingLabel="Creating your account…"
        >
          Create account
        </SubmitButton>
      </form>
    </div>
  );
}
