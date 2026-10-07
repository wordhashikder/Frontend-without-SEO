import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow, Section } from "@/components/ui/layout";
import { routes } from "@/lib/site";

type CtaBandProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  buttonLabel?: string;
  href?: string;
  /** Secondary line under the button, e.g. "Are you an electrician? Join". */
  footnote?: ReactNode;
};

/** Centred call to action on a mint band; closes most content pages. */
export function CtaBand({
  eyebrow,
  title,
  lead,
  buttonLabel = "Get Free Quotes",
  href = routes.quotes,
  footnote,
}: CtaBandProps) {
  return (
    <Section tone="mint" spacing="lg">
      <Container className="text-center">
        <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
        <h2 className="mx-auto max-w-3xl text-[28px] font-bold leading-tight tracking-[-0.01em] sm:text-4xl md:text-[44px]">
          {title}
        </h2>
        {lead ? (
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg">{lead}</p>
        ) : null}
        <ButtonLink href={href} arrow size="lg" className="mt-8">
          {buttonLabel}
        </ButtonLink>
        {footnote ? <div className="mt-6 text-sm">{footnote}</div> : null}
      </Container>
    </Section>
  );
}
