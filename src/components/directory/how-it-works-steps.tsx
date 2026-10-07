import {
  ArrowRight,
  FileText,
  type LucideIcon,
  Mail,
  User,
} from "lucide-react";
import { StepNumber } from "@/components/sections/feature-blocks";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Section, SectionHeading } from "@/components/ui/layout";

export type QuoteStep = { icon: LucideIcon; name: string; text: string };

/** The three homeowner steps, worded for a location. Also feeds the HowTo schema. */
export function quoteSteps(city: string): QuoteStep[] {
  return [
    {
      icon: FileText,
      name: "Request a free quote",
      text: "Enter your postcode and tell us what you need. It only takes a minute and there's no obligation.",
    },
    {
      icon: Mail,
      name: "Receive quotes from vetted installers",
      text: `We'll match you with up to 5 trusted, local EV charger installers in ${city}.`,
    },
    {
      icon: User,
      name: "Choose the right installer",
      text: "Compare your quotes and each installer's reviews, then choose who to contact. The decision is always yours.",
    },
  ];
}

/** "Get your EV charger installed in 3 simple steps" mint band. */
export function HowItWorksSteps({
  city,
  steps,
}: {
  city: string;
  steps: QuoteStep[];
}) {
  return (
    <Section
      tone="mint"
      aria-labelledby="steps-heading"
      className="md:py-[88px]"
    >
      <Container>
        <SectionHeading
          id="steps-heading"
          eyebrow="How it works"
          title="Get your EV charger installed in 3 simple steps"
          lead={`We make it easy to find and compare trusted local installers in ${city}.`}
        />
        <ol className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-x-8 lg:gap-x-[130px]">
          {steps.map((step, index) => (
            <li key={step.name} className="relative text-center">
              <span className="relative inline-block">
                <IconBadge icon={step.icon} tone="green" size="lg" />
                <StepNumber
                  tone="green"
                  className="absolute -bottom-1 -left-1.5 size-7 text-sm ring-2 ring-white"
                >
                  {index + 1}
                </StepNumber>
              </span>
              <h3 className="mx-auto mt-6 max-w-[320px] text-xl font-extrabold leading-[1.5] tracking-[-0.01em] lg:mt-7 lg:text-2xl lg:leading-[1.65]">
                <span className="sr-only">Step {index + 1}: </span>
                {step.name}
              </h3>
              <p className="mx-auto mt-3 max-w-[310px] text-sm leading-[1.45] lg:mt-6">
                {step.text}
              </p>
              {index < steps.length - 1 ? (
                <ArrowRight
                  aria-hidden
                  className="absolute top-11 left-[calc(100%+65px)] hidden size-10 -translate-x-1/2 text-ink lg:block"
                  strokeWidth={1.5}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
