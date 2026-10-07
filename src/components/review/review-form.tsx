"use client";

import { Check } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  type ReviewField,
  type ReviewFormState,
  submitReview,
} from "@/actions/review";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  describedBy,
  Field,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui/form";
import { Eyebrow } from "@/components/ui/layout";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

const STAR_PATH =
  "M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8L10 14.5l-5.1 2.9 1.1-5.8-4.3-4 5.8-.7L10 1.6z";

const ratingWords = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const BODY_MIN = 20;
const BODY_MAX = 1500;

/** Order in which fields appear, used to focus the first one with an error. */
const fieldIds: [ReviewField, string][] = [
  ["rating", "review-rating-1"],
  ["title", "review-title"],
  ["body", "review-body"],
  ["author_name", "review-name"],
  ["author_location", "review-location"],
];

const initialState: ReviewFormState = { ok: false };

/** 16px text on phones stops iOS zooming into the field on focus. */
const inputClass = "h-12 text-base sm:text-[15px]";

type ReviewFormProps = {
  token: string;
  installerName: string;
};

export function ReviewForm({ token, installerName }: ReviewFormProps) {
  const [state, formAction, pending] = useActionState(
    submitReview,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  // Controlled fields keep what was typed when the server sends back errors.
  const [rating, setRating] = useState(Number(state.values?.rating) || 0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState(state.values?.title ?? "");
  const [body, setBody] = useState(state.values?.body ?? "");
  const [name, setName] = useState(state.values?.author_name ?? "");
  const [location, setLocation] = useState(state.values?.author_location ?? "");

  const doneRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state.ok) {
      doneRef.current?.focus();
      return;
    }
    const firstInvalid = fieldIds.find(([field]) => state.fieldErrors?.[field]);
    if (firstInvalid) document.getElementById(firstInvalid[1])?.focus();
  }, [state]);

  if (state.ok) {
    return (
      <div>
        <span
          aria-hidden
          className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_0_8px_var(--color-primary-soft)]"
        >
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <Eyebrow className="mt-7 mb-2">Review received</Eyebrow>
        <h1
          ref={doneRef}
          tabIndex={-1}
          className="text-[26px] font-bold leading-[1.2] tracking-[-0.01em] focus:outline-none sm:text-[32px]"
        >
          Thank you for your review
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed sm:text-base">
          Reviews are checked before they appear, so yours won&apos;t show on{" "}
          {installerName}&apos;s profile straight away. Your feedback helps
          other homeowners choose an installer with confidence.
        </p>
        <ButtonLink href={routes.home} size="lg" arrow className="mt-8">
          Back to home
        </ButtonLink>
      </div>
    );
  }

  const shown = hover || rating;
  const bodyLength = body.trim().length;

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="token" value={token} />

      <Eyebrow className="mb-2">Your review</Eyebrow>
      <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.01em] sm:text-[30px]">
        How was your experience with {installerName}?
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed">
        Your review helps other homeowners choose an installer with confidence.
        It only takes a minute.
      </p>

      <fieldset
        className="mt-7 min-w-0"
        aria-describedby={
          errors.rating ? "review-rating-error" : "review-rating-word"
        }
      >
        <legend className="mb-1 block p-0 text-sm font-semibold text-ink">
          Your rating
        </legend>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: hover only previews the stars; selection uses the radio inputs */}
          <div className="-ml-1.5 flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <label
                key={value}
                onMouseEnter={() => setHover(value)}
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-0 has-[:focus-visible]:outline-primary"
              >
                <input
                  id={`review-rating-${value}`}
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  required
                  className="sr-only"
                />
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className={cn(
                    "size-8 transition-colors duration-100",
                    value <= shown ? "text-star" : "text-[#d9dee4]",
                  )}
                >
                  <path d={STAR_PATH} fill="currentColor" />
                </svg>
                <span className="sr-only">
                  {value} {value === 1 ? "star" : "stars"}: {ratingWords[value]}
                </span>
              </label>
            ))}
          </div>
          <p id="review-rating-word" className="text-sm font-medium text-ink">
            {shown ? ratingWords[shown] : ""}
          </p>
        </div>
        {errors.rating ? (
          <p
            id="review-rating-error"
            role="alert"
            className="mt-1 text-xs text-red-600"
          >
            {errors.rating}
          </p>
        ) : null}
      </fieldset>

      <div className="mt-6 grid gap-5">
        <Field
          label="Review title"
          htmlFor="review-title"
          error={errors.title}
          hint="A short summary of your experience."
        >
          <Input
            id="review-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            aria-required
            {...describedBy(
              "review-title",
              errors.title,
              "A short summary of your experience.",
            )}
            className={inputClass}
          />
        </Field>

        <div>
          <Field label="Your review" htmlFor="review-body" error={errors.body}>
            <Textarea
              id="review-body"
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={BODY_MAX}
              rows={6}
              aria-required
              aria-invalid={errors.body ? true : undefined}
              aria-describedby={
                errors.body
                  ? "review-body-error review-body-count"
                  : "review-body-count"
              }
              className="min-h-36 text-base sm:text-[15px]"
            />
          </Field>
          <p
            id="review-body-count"
            className="mt-1.5 flex justify-between gap-3 text-xs text-subtle"
          >
            <span>
              {bodyLength < BODY_MIN ? `At least ${BODY_MIN} characters.` : ""}
            </span>
            <span className="tabular-nums">
              {body.length} / {BODY_MAX.toLocaleString("en-GB")}
            </span>
          </p>
        </div>

        <Field
          label="Your name as it should appear"
          htmlFor="review-name"
          error={errors.author_name}
          hint="e.g. Steve M."
        >
          <Input
            id="review-name"
            name="author_name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            autoComplete="name"
            aria-required
            {...describedBy("review-name", errors.author_name, "e.g. Steve M.")}
            className={inputClass}
          />
        </Field>

        <Field
          label="Town or city"
          htmlFor="review-location"
          optional
          error={errors.author_location}
        >
          <Input
            id="review-location"
            name="author_location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={60}
            autoComplete="address-level2"
            {...describedBy("review-location", errors.author_location)}
            className={inputClass}
          />
        </Field>
      </div>

      <div aria-live="assertive" className={state.message ? "mt-6" : undefined}>
        {state.message ? (
          <FormMessage tone="error">{state.message}</FormMessage>
        ) : null}
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
        {pending ? "Sending your review…" : "Submit review"}
      </Button>
      <p className="mt-4 text-center text-xs leading-relaxed">
        Your name and town are shown with your review. Reviews are checked
        before they appear.
      </p>
    </form>
  );
}
