import { Check } from "lucide-react";
import type { RefObject } from "react";
import type { QuoteResult } from "@/components/quote/state";
import { StepNumber } from "@/components/sections/feature-blocks";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/layout";
import { routes } from "@/lib/site";

type ConfirmationProps = {
  headingRef: RefObject<HTMLHeadingElement | null>;
  result: QuoteResult;
};

/** Shown once the request has been accepted. There is nothing here to resubmit. */
export function Confirmation({ headingRef, result }: ConfirmationProps) {
  // One message for every request, however it was matched behind the scenes:
  // homeowners are never told how many installers, or which, received it.
  const steps = [
    {
      title: "Check your inbox",
      text: `We've sent a confirmation email to ${result.email}. You'll find a personal link inside to view your quotes, read messages from installers and keep track of your request all in one place.`,
    },
    {
      title: "We've notified local installers",
      text: `Qualified installers covering ${result.postcode} will be notified of your enquiry and can respond with a quote as soon as they're available. We'll send you an email whenever a new quote arrives, so you won't miss a thing.`,
    },
    {
      title: "Compare with confidence",
      text: "PickASparky is completely free for homeowners, with no hidden fees or obligation. Compare your quotes and choose the right installer for your project.",
    },
  ];

  return (
    <div>
      <span
        aria-hidden
        className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_0_8px_var(--color-primary-soft)]"
      >
        <Check className="size-7" strokeWidth={2.5} />
      </span>
      <Eyebrow className="mt-7 mb-2">Request sent</Eyebrow>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-[26px] font-bold leading-[1.2] tracking-[-0.01em] text-ink focus:outline-none sm:text-[32px]"
      >
        Thanks{result.firstName ? `, ${result.firstName}` : ""}. We&apos;ve
        received your request
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed sm:text-base">
        We&apos;ll notify you as soon as an installer responds.
      </p>

      <dl className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-xl bg-mint-soft px-5 py-4">
        <dt className="text-sm">Your reference number</dt>
        <dd className="text-lg font-bold tracking-[0.02em] text-ink">
          {result.reference}
        </dd>
      </dl>

      <h2 className="mt-8 text-lg font-bold">What happens next</h2>
      <ol className="mt-4 grid gap-5">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <StepNumber tone="mint">{index + 1}</StepNumber>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-snug">
                {step.title}
              </h3>
              <p className="mt-1 wrap-break-word text-sm leading-relaxed">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
        <ButtonLink href={routes.home} size="lg" arrow>
          Back to home
        </ButtonLink>
        <ButtonLink href={routes.howItWorks} variant="link" className="py-3">
          How PickASparky works
        </ButtonLink>
      </div>
    </div>
  );
}
