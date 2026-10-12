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
import { keyed } from "@/lib/utils";

export type QuoteStep = { icon: LucideIcon; name: string; text: string };

const stepIcons = [FileText, Mail, User];

/**
 * The three homeowner steps from the editable location template. Each step's
 * icon pairs with it by position. Also feeds the HowTo schema.
 */
export function quoteSteps(
  items: readonly { title: string; text: string }[],
): QuoteStep[] {
  return items.map((item, index) => ({
    icon: stepIcons[index % stepIcons.length],
    name: item.title,
    text: item.text,
  }));
}

/** "Get your EV charger installed in 3 simple steps" mint band. */
export function HowItWorksSteps({
  eyebrow,
  title,
  lead,
  steps,
}: {
  eyebrow: string;
  title: string;
  lead: string;
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
          eyebrow={eyebrow}
          title={title}
          lead={lead}
        />
        <ol className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-x-8 lg:gap-x-[130px]">
          {keyed(steps, (step) => step.name).map(
            ({ item: step, key }, index) => (
              <li key={key} className="relative text-center">
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
            ),
          )}
        </ol>
      </Container>
    </Section>
  );
}
