"use client";

import { ArrowLeft, Check, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
  type ReactNode,
  type RefObject,
  type SubmitEvent,
  useEffect,
  useRef,
} from "react";
import { OptionCards, optionCardClass } from "@/components/quote/option-cards";
import type { Answers } from "@/components/quote/state";
import { Button } from "@/components/ui/button";
import {
  describedBy,
  Field,
  Honeypot,
  Input,
  Textarea,
} from "@/components/ui/form";
import {
  contactStep,
  notesField,
  type Option,
  postcodeStep,
  type QuoteFieldErrors,
  quoteLimits,
  timing,
  vehicleStep,
} from "@/content/quote-questions";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Long enough to see the selected state, short enough to feel instant. */
const ADVANCE_DELAY_MS = 280;

type HeadingRef = RefObject<HTMLHeadingElement | null>;

const headingClass =
  "text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-ink focus:outline-none sm:text-[28px]";

/** 16px text on phones stops iOS zooming into the field on focus. */
const inputClass = "h-12 text-base sm:text-[15px]";

/** The question. Receives focus when its screen appears, for screen readers. */
function StepHeading({
  headingRef,
  children,
}: {
  headingRef: HeadingRef;
  children: ReactNode;
}) {
  return (
    <h1 ref={headingRef} tabIndex={-1} className={headingClass}>
      {children}
    </h1>
  );
}

function StepNav({
  onBack,
  label = "Next",
  disabled,
}: {
  onBack?: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3 sm:mt-8">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-muted transition-colors hover:text-ink disabled:opacity-60"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={2.25} />
          Back
        </button>
      ) : (
        <span />
      )}
      <Button type="submit" size="lg" arrow disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}

/** Runs `callback` after the short "selected" pause; cancelled if the screen changes. */
function useAutoAdvance() {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (callback: () => void) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(callback, ADVANCE_DELAY_MS);
  };
}

const preventDefault = (handler: () => void) => (event: SubmitEvent) => {
  event.preventDefault();
  handler();
};

// ---- Start: postcode ---------------------------------------------------------

type PostcodeStepProps = {
  headingRef: HeadingRef;
  value: string;
  error?: string;
  pending: boolean;
  installerSlug?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function PostcodeStep({
  headingRef,
  value,
  error,
  pending,
  installerSlug,
  onChange,
  onSubmit,
}: PostcodeStepProps) {
  const id = "quote-postcode";
  return (
    // A real GET form, so the postcode still reaches the server without JavaScript.
    <form
      action={routes.quotes}
      method="get"
      noValidate
      onSubmit={preventDefault(onSubmit)}
    >
      {installerSlug ? (
        <input type="hidden" name="installer" value={installerSlug} />
      ) : null}
      <h2 ref={headingRef} tabIndex={-1} className={headingClass}>
        <label htmlFor={id}>{postcodeStep.title}</label>
      </h2>
      <p className="mt-2 text-sm leading-relaxed">
        We use it to find installers whose service area covers your address.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <MapPin
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted"
            strokeWidth={1.75}
          />
          <Input
            id={id}
            name="postcode"
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete="postal-code"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="go"
            maxLength={8}
            placeholder={postcodeStep.placeholder}
            aria-required
            {...describedBy(id, error)}
            className="h-[52px] pl-11 text-base font-medium uppercase placeholder:font-normal placeholder:normal-case"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          arrow
          disabled={pending}
          aria-busy={pending || undefined}
          className="shrink-0"
        >
          {pending ? "Checking postcode…" : postcodeStep.button}
        </Button>
      </div>
      <p
        id={`${id}-error`}
        aria-live="polite"
        className={cn("text-sm text-red-600", error ? "mt-2.5" : "sr-only")}
      >
        {error}
      </p>
    </form>
  );
}

// ---- Questions 1 to 4: one tap ------------------------------------------------

type ChoiceStepProps<T extends string> = {
  headingRef: HeadingRef;
  name: string;
  title: string;
  options: readonly Option<T>[];
  value: T | "";
  error?: string;
  /** Short line above the question, e.g. the coverage reassurance on Question 1. */
  notice?: ReactNode;
  onSelect: (value: T) => void;
  /** Move on. `value` is set when the customer tapped an answer. */
  onNext: (value?: T) => void;
  onBack: () => void;
};

export function ChoiceStep<T extends string>({
  headingRef,
  name,
  title,
  options,
  value,
  error,
  notice,
  onSelect,
  onNext,
  onBack,
}: ChoiceStepProps<T>) {
  const advance = useAutoAdvance();
  return (
    <form noValidate onSubmit={preventDefault(() => onNext())}>
      {notice}
      <OptionCards
        legend={<StepHeading headingRef={headingRef}>{title}</StepHeading>}
        name={name}
        options={options}
        value={value}
        error={error}
        onSelect={onSelect}
        onCommit={(chosen) => advance(() => onNext(chosen))}
      />
      <StepNav onBack={onBack} />
    </form>
  );
}

// ---- Question 5: vehicle (optional) --------------------------------------------

type VehicleStepProps = {
  headingRef: HeadingRef;
  vehicle: string;
  undecided: boolean;
  error?: string;
  onChange: (patch: Partial<Answers>) => void;
  onNext: (patch?: Partial<Answers>) => void;
  onBack: () => void;
};

export function VehicleStep({
  headingRef,
  vehicle,
  undecided,
  error,
  onChange,
  onNext,
  onBack,
}: VehicleStepProps) {
  const advance = useAutoAdvance();
  const pointerAt = useRef(0);
  const id = "quote-vehicle";
  const answered = undecided || vehicle.trim().length > 0;

  return (
    <form noValidate onSubmit={preventDefault(() => onNext())}>
      <StepHeading headingRef={headingRef}>{vehicleStep.title}</StepHeading>
      <p className="mt-2 text-sm leading-relaxed">
        This one is optional. Skip it if you&apos;d rather not say.
      </p>

      <Field
        label={vehicleStep.label}
        htmlFor={id}
        error={error}
        className="mt-6"
      >
        <Input
          id={id}
          name="vehicle"
          type="text"
          value={vehicle}
          onChange={(event) => onChange({ vehicle: event.target.value })}
          maxLength={quoteLimits.vehicle}
          autoComplete="off"
          enterKeyHint="next"
          placeholder={vehicleStep.placeholder}
          {...describedBy(id, error)}
          className={inputClass}
        />
      </Field>

      <label
        className={cn(optionCardClass, "mt-3")}
        onPointerDown={() => {
          pointerAt.current = Date.now();
        }}
      >
        <span className="relative inline-flex size-5 shrink-0">
          <input
            type="checkbox"
            name="vehicle_undecided"
            checked={undecided}
            onChange={(event) => {
              const checked = event.target.checked;
              onChange({ vehicle_undecided: checked });
              // A tap on this answer is the whole answer: move on, like a radio card.
              if (checked && Date.now() - pointerAt.current < 1_500) {
                advance(() => onNext({ vehicle_undecided: true }));
              }
              pointerAt.current = 0;
            }}
            className="peer size-5 cursor-pointer appearance-none rounded-md border-[1.5px] border-[#b4bfca] bg-white transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none"
          />
          <Check
            aria-hidden
            className="pointer-events-none absolute inset-0 m-auto size-3.5 text-white opacity-0 peer-checked:opacity-100"
            strokeWidth={3}
          />
        </span>
        <span className="min-w-0 flex-1">{vehicleStep.undecidedLabel}</span>
      </label>

      <StepNav onBack={onBack} label={answered ? "Continue" : "Skip"} />
    </form>
  );
}

// ---- Question 6: timing + optional notes ---------------------------------------

type TimingStepProps = {
  headingRef: HeadingRef;
  value: Answers["timing"];
  notes: string;
  errors: QuoteFieldErrors;
  onChange: (patch: Partial<Answers>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function TimingStep({
  headingRef,
  value,
  notes,
  errors,
  onChange,
  onNext,
  onBack,
}: TimingStepProps) {
  const id = "quote-notes";
  return (
    <form noValidate onSubmit={preventDefault(onNext)}>
      {/* No auto-advance here: the notes field below belongs to this screen. */}
      <OptionCards
        legend={
          <StepHeading headingRef={headingRef}>{timing.title}</StepHeading>
        }
        name="timing"
        options={timing.options}
        value={value}
        error={errors.timing}
        onSelect={(chosen) => onChange({ timing: chosen })}
      />

      <Field
        label={notesField.label}
        htmlFor={id}
        optional
        error={errors.notes}
        hint={notesField.hint}
        className="mt-7 border-t border-line pt-6"
      >
        <Textarea
          id={id}
          name="notes"
          value={notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          maxLength={quoteLimits.notes}
          rows={3}
          {...describedBy(id, errors.notes, notesField.hint)}
          className="min-h-24 text-base sm:text-[15px]"
        />
      </Field>

      <StepNav onBack={onBack} label="Continue" />
    </form>
  );
}

// ---- Final step: contact details + consent -------------------------------------

type ContactStepProps = {
  headingRef: HeadingRef;
  answers: Answers;
  errors: QuoteFieldErrors;
  pending: boolean;
  /** Banner for a failed submit, shown next to the button. */
  message?: ReactNode;
  onChange: (patch: Partial<Answers>) => void;
  onSubmit: (honeypot: string) => void;
  onBack: () => void;
};

export function ContactStep({
  headingRef,
  answers,
  errors,
  pending,
  message,
  onChange,
  onSubmit,
  onBack,
}: ContactStepProps) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const honeypot = new FormData(event.currentTarget).get("website");
        onSubmit(typeof honeypot === "string" ? honeypot : "");
      }}
      className="relative"
    >
      <StepHeading headingRef={headingRef}>{contactStep.title}</StepHeading>
      <p className="mt-2 text-sm leading-relaxed">
        Installers use these details to send you their quote.
      </p>

      <div className="mt-6 grid gap-5">
        <Field
          label={contactStep.firstName}
          htmlFor="quote-first-name"
          error={errors.first_name}
        >
          <Input
            id="quote-first-name"
            name="first_name"
            type="text"
            value={answers.first_name}
            onChange={(event) => onChange({ first_name: event.target.value })}
            autoComplete="given-name"
            autoCapitalize="words"
            maxLength={quoteLimits.firstName}
            enterKeyHint="next"
            aria-required
            {...describedBy("quote-first-name", errors.first_name)}
            className={inputClass}
          />
        </Field>
        <Field
          label={contactStep.email}
          htmlFor="quote-email"
          error={errors.email}
        >
          <Input
            id="quote-email"
            name="email"
            type="email"
            inputMode="email"
            value={answers.email}
            onChange={(event) => onChange({ email: event.target.value })}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={quoteLimits.email}
            enterKeyHint="next"
            aria-required
            {...describedBy("quote-email", errors.email)}
            className={inputClass}
          />
        </Field>
        <Field
          label={contactStep.phone}
          htmlFor="quote-phone"
          error={errors.phone}
        >
          <Input
            id="quote-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            value={answers.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            autoComplete="tel"
            maxLength={30}
            enterKeyHint="done"
            aria-required
            {...describedBy("quote-phone", errors.phone)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-6">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink">
          <span className="relative mt-0.5 inline-flex size-5 shrink-0">
            <input
              id="quote-consent"
              type="checkbox"
              name="consent"
              checked={answers.consent}
              onChange={(event) => onChange({ consent: event.target.checked })}
              aria-required
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={
                errors.consent ? "quote-consent-error" : undefined
              }
              className="peer size-5 cursor-pointer appearance-none rounded-md border-[1.5px] border-[#b4bfca] bg-white transition-colors checked:border-primary checked:bg-primary aria-[invalid=true]:border-red-500"
            />
            <Check
              aria-hidden
              className="pointer-events-none absolute inset-0 m-auto size-3.5 text-white opacity-0 peer-checked:opacity-100"
              strokeWidth={3}
            />
          </span>
          <span>{contactStep.consent}</span>
        </label>
        <p
          id="quote-consent-error"
          aria-live="polite"
          className={cn(
            "pl-8 text-xs text-red-600",
            errors.consent ? "mt-1.5" : "sr-only",
          )}
        >
          {errors.consent}
        </p>
        <p className="mt-2 pl-8 text-xs leading-relaxed">
          See our{" "}
          <Link
            href={routes.privacy}
            target="_blank"
            className="font-medium text-ink underline underline-offset-2 hover:text-primary"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href={routes.terms}
            target="_blank"
            className="font-medium text-ink underline underline-offset-2 hover:text-primary"
          >
            Terms &amp; Conditions
          </Link>{" "}
          <span className="sr-only">(each opens in a new tab)</span>
          for how we handle your details.
        </p>
      </div>

      <Honeypot />

      <div aria-live="assertive" className={message ? "mt-6" : undefined}>
        {message}
      </div>

      <Button
        type="submit"
        size="lg"
        arrow={!pending}
        fullWidth
        disabled={pending}
        aria-busy={pending || undefined}
        className="mt-6"
      >
        {pending ? "Sending your request…" : contactStep.button}
      </Button>

      <p className="mt-4 flex items-start justify-center gap-2 text-xs leading-relaxed">
        <ShieldCheck
          aria-hidden
          className="mt-px size-4 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        <span>
          Your details are only shared with the installers matched to your
          request.
        </span>
      </p>

      <div className="mt-2 flex justify-start">
        <button
          type="button"
          onClick={onBack}
          disabled={pending}
          className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-muted transition-colors hover:text-ink disabled:opacity-60"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={2.25} />
          Back
        </button>
      </div>
    </form>
  );
}
