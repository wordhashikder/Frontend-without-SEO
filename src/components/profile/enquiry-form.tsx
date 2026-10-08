"use client";

import { MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useActionState, useEffect, useRef } from "react";
import { type EnquiryState, sendInstallerEnquiry } from "@/actions/enquiry";
import { Button, ButtonLink } from "@/components/ui/button";
import { describedBy, FormMessage, Honeypot } from "@/components/ui/form";
import { IconBadge } from "@/components/ui/icon-badge";
import { enquiryForm, enquiryLimits } from "@/content/enquiry-form";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

const initialState: EnquiryState = { ok: false };

/** The quote card's compact field style, as in the profile design. */
const control =
  "w-full rounded-lg border border-line bg-[#f9fafb] px-4 text-sm text-ink transition-colors placeholder:text-subtle focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500";

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
};

function CardField({ id, label, optional, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-subtle">(optional)</span>
        ) : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs leading-snug text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

type EnquiryFormProps = {
  installerSlug: string;
  businessName: string;
  /** False for Free-plan installers: the request goes to the PickASparky team. */
  direct: boolean;
};

/**
 * "Request a Quote" on an installer's profile: name, email, phone (optional) and
 * a message, sent straight to this installer. A Server Action handles it, so it
 * also works as an ordinary form post before hydration or without JavaScript.
 */
export function EnquiryForm({
  installerSlug,
  businessName,
  direct,
}: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(
    sendInstallerEnquiry,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  // Move focus to the outcome: the confirmation, or the first field to fix.
  useEffect(() => {
    if (state.ok) {
      confirmationRef.current?.focus();
    } else if (state.fieldErrors) {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);

  if (state.ok) {
    return (
      <div
        ref={confirmationRef}
        role="status"
        tabIndex={-1}
        className="flex flex-col items-center py-4 text-center focus:outline-none"
      >
        <IconBadge icon={MailCheck} tone="green" />
        <h3 className="mt-4 text-lg font-bold leading-snug">
          {enquiryForm.sent.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed">
          {enquiryForm.sent.body(businessName, direct)}
        </p>
        <ButtonLink
          href={routes.quotes}
          variant="link"
          arrow
          className="mt-4 whitespace-normal"
        >
          {enquiryForm.sent.more}
        </ButtonLink>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="relative mt-3.5 space-y-3"
    >
      <input type="hidden" name="installer" value={installerSlug} />

      <CardField
        id="enquiry-name"
        label={enquiryForm.name.label}
        error={errors.name}
      >
        <input
          id="enquiry-name"
          name="name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          required
          maxLength={enquiryLimits.name}
          placeholder={enquiryForm.name.placeholder}
          defaultValue={values.name}
          {...describedBy("enquiry-name", errors.name)}
          className={cn(control, "h-[42px]")}
        />
      </CardField>

      <CardField
        id="enquiry-email"
        label={enquiryForm.email.label}
        error={errors.email}
      >
        <input
          id="enquiry-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={enquiryLimits.email}
          placeholder={enquiryForm.email.placeholder}
          defaultValue={values.email}
          {...describedBy("enquiry-email", errors.email)}
          className={cn(control, "h-[42px]")}
        />
      </CardField>

      <CardField
        id="enquiry-phone"
        label={enquiryForm.phone.label}
        optional
        error={errors.phone}
      >
        <input
          id="enquiry-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={enquiryLimits.phone}
          placeholder={enquiryForm.phone.placeholder}
          defaultValue={values.phone}
          {...describedBy("enquiry-phone", errors.phone)}
          className={cn(control, "h-[42px]")}
        />
      </CardField>

      <CardField
        id="enquiry-message"
        label={enquiryForm.message.label}
        error={errors.message}
      >
        <textarea
          id="enquiry-message"
          name="message"
          required
          rows={4}
          maxLength={enquiryLimits.message}
          placeholder={enquiryForm.message.placeholder}
          defaultValue={values.message}
          {...describedBy("enquiry-message", errors.message)}
          className={cn(control, "min-h-24 resize-y py-2.5 leading-relaxed")}
        />
      </CardField>

      <Honeypot />

      {state.message ? (
        <FormMessage tone="error">
          {state.message}
          {state.unavailable ? (
            <>
              {" "}
              <Link
                href={routes.quotes}
                className="font-semibold underline underline-offset-2"
              >
                Get free quotes
              </Link>
            </>
          ) : null}
        </FormMessage>
      ) : null}

      {/* aria-disabled rather than disabled, so keyboard focus is not lost while sending. */}
      <Button
        type="submit"
        arrow={!pending}
        fullWidth
        aria-disabled={pending}
        aria-busy={pending || undefined}
        onClick={pending ? (event) => event.preventDefault() : undefined}
        className="mt-1 aria-disabled:pointer-events-none aria-disabled:opacity-60"
      >
        {pending ? "Sending…" : enquiryForm.button}
      </Button>

      <p className="flex gap-2 pt-1 text-[11px] leading-[15px]">
        <ShieldCheck
          aria-hidden
          className="mt-px size-3.5 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        {enquiryForm.privacy(businessName, direct)}
      </p>
    </form>
  );
}
