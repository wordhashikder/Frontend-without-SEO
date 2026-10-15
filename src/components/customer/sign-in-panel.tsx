"use client";

import { MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { type CustomerActionState, requestMagicLink } from "@/actions/customer";
import { SubmitButton } from "@/components/auth/submit-button";
import { describedBy, Field, FormMessage, Input } from "@/components/ui/form";
import { Container, Eyebrow } from "@/components/ui/layout";

const initialState: CustomerActionState = { ok: false };

const linkProblems: Record<string, string> = {
  invalid:
    "That link has expired or has already been used. Enter your email address and we'll send you a fresh one.",
  unavailable:
    "We couldn't sign you in just now. Please try your link again in a few minutes, or request a new one below.",
  busy: "Too many attempts. Please wait a few minutes, then request a new link below.",
};

/** Signed out: ask for the email address and send a fresh magic link. */
export function SignInPanel() {
  const [state, action] = useActionState(requestMagicLink, initialState);
  const problem = linkProblems[useSearchParams().get("link") ?? ""];
  const error = state.fieldErrors?.email;

  return (
    <section className="bg-gradient-to-b from-surface to-white">
      <Container className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[480px] rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <span
            aria-hidden
            className="inline-flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary"
          >
            <MailCheck className="size-6" />
          </span>
          <Eyebrow className="mt-5 mb-2">My quotes</Eyebrow>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[28px]">
            Get your secure link
          </h1>
          <p className="mt-3 text-sm leading-relaxed">
            There's no password to remember. Enter the email address you used
            for your quote request and we'll email you a link that opens your
            quotes, messages and request status.
          </p>
          {problem ? (
            <div className="mt-5">
              <FormMessage tone="error">{problem}</FormMessage>
            </div>
          ) : null}
          {state.ok ? (
            <div className="mt-5">
              <FormMessage tone="success">{state.message}</FormMessage>
            </div>
          ) : (
            <form action={action} className="mt-6 space-y-4" noValidate>
              <Field
                label="Email address"
                htmlFor="customer-email"
                error={error}
              >
                <Input
                  id="customer-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="you@example.com"
                  {...describedBy("customer-email", error)}
                />
              </Field>
              {state.message && !state.ok ? (
                <FormMessage tone="error">{state.message}</FormMessage>
              ) : null}
              <SubmitButton size="lg" fullWidth arrow pendingLabel="Sending…">
                Email me my link
              </SubmitButton>
            </form>
          )}
          <p className="mt-6 text-xs leading-relaxed text-subtle">
            Haven't asked for a quote yet?{" "}
            <a
              href="/get-quotes/"
              className="font-medium text-primary underline underline-offset-2"
            >
              Get free quotes
            </a>
            . We email a link like this with every request.
          </p>
        </div>
      </Container>
    </section>
  );
}
