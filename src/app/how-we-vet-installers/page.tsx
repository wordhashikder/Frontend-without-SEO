import {
  ArrowRight,
  Award,
  FileText,
  IdCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { FaqList } from "@/components/sections/faq";
import { Callout, StepNumber } from "@/components/sections/feature-blocks";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { CheckBullet, IconBadge } from "@/components/ui/icon-badge";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { cn, keyed } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("how-we-vet");
  return pageMetadata({ ...seo, path: routes.vetting });
}

/* Each step's icon pairs with the editable steps by position. */
const stepIcons = [FileText, Award, IdCard, MapPin, ShieldCheck];

export default async function VettingPage() {
  const { seo, hero, process, outcomes, faq } = await getContent("how-we-vet");
  const steps = process.steps;
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.lead}
        aside={
          <Callout
            title={hero.callout_title}
            className="lg:min-h-[296px] lg:self-start"
          >
            <p className="sm:text-xl sm:leading-[1.5]">{hero.callout_text}</p>
          </Callout>
        }
      />

      {/* Vetting process */}
      <Section
        spacing="sm"
        aria-labelledby="process-heading"
        className="md:pt-5 md:pb-20"
      >
        <Container>
          <SectionHeading
            id="process-heading"
            title={process.title}
            lead={process.lead}
          />
          <ol className="mt-8 divide-y divide-line lg:mt-10 lg:grid lg:grid-cols-5 lg:divide-x lg:divide-y-0">
            {keyed(steps, (step) => step.title).map(
              ({ item: step, key }, index) => (
                <li
                  key={key}
                  className="py-6 first:pt-0 last:pb-0 sm:flex sm:gap-6 lg:block lg:pt-4 lg:pr-10 lg:pb-6 lg:pl-4 lg:first:pt-4 lg:last:pr-4 lg:last:pb-6"
                >
                  <div className="flex shrink-0 items-center gap-4">
                    <StepNumber>{index + 1}</StepNumber>
                    <IconBadge
                      icon={stepIcons[index % stepIcons.length]}
                      size="lg"
                      className={cn(index % 2 === 1 && "bg-mint-soft")}
                    />
                  </div>
                  <div className="mt-4 sm:mt-0 lg:mt-7 lg:text-center">
                    <h3 className="relative text-base font-extrabold leading-normal tracking-[-0.01em]">
                      {step.title}
                      {index < steps.length - 1 ? (
                        <ArrowRight
                          aria-hidden
                          className="absolute top-0 -right-8 hidden size-6 text-ink lg:block"
                          strokeWidth={1.75}
                        />
                      ) : null}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed lg:mt-4 lg:leading-5">
                      {step.text}
                    </p>
                  </div>
                </li>
              ),
            )}
          </ol>
        </Container>
      </Section>

      {/* Outcomes */}
      <Section tone="mint" aria-labelledby="outcomes-heading">
        <Container>
          <SectionHeading
            id="outcomes-heading"
            title={outcomes.title}
            lead={outcomes.lead}
          />
          <ul className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {keyed(outcomes.items, (item) => item.title).map(
              ({ item, key }) => (
                <li key={key} className="flex gap-4">
                  <CheckBullet className="size-10" />
                  <div>
                    <h3 className="text-lg font-extrabold leading-[1.5] tracking-[-0.01em] sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-base leading-normal">
                      {item.text}
                    </p>
                  </div>
                </li>
              ),
            )}
          </ul>
        </Container>
      </Section>

      {/* FAQ */}
      <Section aria-labelledby="faq-heading">
        <Container>
          <SectionHeading id="faq-heading" title={faq.title} lead={faq.lead} />
          <FaqList items={faq.items} withSchema className="mt-6 gap-4" />
        </Container>
      </Section>

      <LocationsDirectory />

      <PageSchema
        title={seo.title}
        description={seo.description}
        path={routes.vetting}
        crumb="How We Vet Installers"
      />
    </>
  );
}
