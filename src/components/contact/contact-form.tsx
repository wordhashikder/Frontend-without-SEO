"use client";

import { MailCheck } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { type ContactState, sendContactMessage } from "@/actions/contact";
import { contactSubjects } from "@/components/contact/contact-subjects";
import { Button } from "@/components/ui/button";
import {
  describedBy,
  Field,
  FormMessage,
  Honeypot,
  Input,
  Select,
  Textarea,
} from "@/components/ui/form";
import { IconBadge } from "@/components/ui/icon-badge";

const initialState: ContactState = { ok: false };

// The design sets these labels one step larger than the shared default.
const fieldClass = "[&>label]:text-base";

const headingClass =
  "text-2xl font-bold leading-9 tracking-[-0.01em] sm:text-[28px]";

/**
 * "Send us a message" card content. Submits through a Server Action, so it
 * also works as an ordinary form post before hydration or without JavaScript.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
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
        className="flex h-full flex-col items-center justify-center py-10 text-center focus:outline-none"
      >
        <IconBadge icon={MailCheck} tone="green" size="lg" />
        <h2 className={`mt-6 ${headingClass}`}>Message sent</h2>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed">
          {state.message}
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <>
      <h2 className={headingClass}>Send us a message</h2>
      <form
        ref={formRef}
        action={formAction}
        noValidate
        className="relative mt-6 space-y-4"
      >
        <Field
          label="Your name"
          htmlFor="contact-name"
          error={errors.name}
          className={fieldClass}
        >
          <Input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="John Smith"
            defaultValue={values.name}
            {...describedBy("contact-name", errors.name)}
          />
        </Field>

        <Field
          label="Email address"
          htmlFor="contact-email"
          error={errors.email}
          className={fieldClass}
        >
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            required
            maxLength={254}
            placeholder="your@email.com"
            defaultValue={values.email}
            {...describedBy("contact-email", errors.email)}
          />
        </Field>

        <Field
          label="Subject"
          htmlFor="contact-subject"
          error={errors.subject}
          className={fieldClass}
        >
          <Select
            // Remount so a restored choice survives React's form reset after the action.
            key={values.subject ?? ""}
            id="contact-subject"
            name="subject"
            required
            defaultValue={values.subject ?? ""}
            {...describedBy("contact-subject", errors.subject)}
          >
            <option value="" disabled>
              Select a topic
            </option>
            {contactSubjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Message"
          htmlFor="contact-message"
          error={errors.message}
          className={fieldClass}
        >
          <Textarea
            id="contact-message"
            name="message"
            required
            maxLength={5000}
            placeholder="How can we help you?"
            defaultValue={values.message}
            {...describedBy("contact-message", errors.message)}
          />
        </Field>

        <Honeypot />

        <div className="space-y-4 pt-4">
          {state.message ? (
            <FormMessage tone="error">{state.message}</FormMessage>
          ) : null}
          {/* aria-disabled rather than disabled, so keyboard focus is not lost while sending. */}
          <Button
            type="submit"
            size="lg"
            arrow
            fullWidth
            aria-disabled={pending}
            onClick={pending ? (event) => event.preventDefault() : undefined}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send Message"}
          </Button>
        </div>
      </form>
    </>
  );
}
