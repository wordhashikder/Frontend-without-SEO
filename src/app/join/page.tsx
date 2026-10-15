import {
  Building2,
  ChartNoAxesColumn,
  Check,
  CircleCheck,
  FileText,
  HeartHandshake,
  House,
  Mail,
  Settings,
  Target,
  UsersRound,
  Wrench,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import type { ComponentProps } from "react";
import { PricingCards } from "@/components/join/pricing-cards";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { ClosingSection } from "@/components/sections/closing-section";
import { FaqList } from "@/components/sections/faq";
import { IconColumns, StepNumber } from "@/components/sections/feature-blocks";
import { JsonLd } from "@/components/sections/json-ld";
import { PageSchema } from "@/components/sections/page-schema";
import { ButtonLink } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/layout";
import { plans } from "@/content/plans";
import { getContent } from "@/lib/content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import { keyed } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("join");
  return pageMetadata({ ...seo, path: routes.join });
}

/* Icons and colours pair with the editable lists by position. */
const benefitStyles = [
  { icon: UsersRound, tone: "green" },
  { icon: Target, tone: "peach" },
  { icon: Settings, tone: "green" },
  { icon: ChartNoAxesColumn, tone: "green" },
] as const;

const stepIcons = [FileText, CircleCheck, Mail, HeartHandshake];

const workStyles = [
  { icon: House, tone: "coral" },
  { icon: Wrench, tone: "blue" },
  { icon: Zap, tone: "green" },
  { icon: Building2, tone: "sky" },
  { icon: Settings, tone: "violet" },
] satisfies Pick<
  ComponentProps<typeof IconColumns>["items"][number],
  "icon" | "tone"
>[];

/** Memberships as schema.org offers; prices come from the same data as the cards. */
const membershipSchema = (description: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "PickASparky installer membership",
  description,
  url: absoluteUrl(routes.join),
  serviceType: "Customer enquiries and business listing for electricians",
  provider: { "@id": `${site.url}/#organization` },
  areaServed: { "@type": "Country", name: "United Kingdom" },
  audience: {
    "@type": "BusinessAudience",
    name: "Electricians and EV charger installers",
  },
  offers: plans.map((plan) => ({
    "@type": "Offer",
    name: `${plan.name} membership`,
    description: plan.features.join(". "),
    url: absoluteUrl(`${routes.register}?plan=${plan.key}`),
    price: plan.price,
    priceCurrency: "GBP",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: plan.price,
      priceCurrency: "GBP",
      billingIncrement: 1,
      unitCode: "MON",
      unitText: "month",
    },
  })),
});

export default async function JoinPage() {
  const content = await getContent("join");
  const { seo, hero, benefits, steps, work, faq } = content;
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden">
        <Container className="grid lg:grid-cols-[minmax(0,620fr)_minmax(0,570fr)] lg:gap-[30px]">
          <div className="pt-12 pb-10 md:py-20">
            <Eyebrow className="mb-2">{hero.eyebrow}</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[1.25] tracking-[-0.01em] sm:text-[40px] md:text-5xl md:leading-[1.45] xl:[text-wrap:wrap]">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-[600px] text-base leading-relaxed sm:text-xl sm:leading-[1.6] md:text-[22px] md:leading-8">
              {hero.lead}
            </p>
            <ButtonLink
              href={routes.register}
              size="lg"
              arrow
              className="mt-8 md:mt-10"
            >
              {hero.button}
            </ButtonLink>
            <ul className="mt-4 flex flex-col gap-x-7 gap-y-2.5 sm:flex-row sm:flex-wrap">
              {keyed(hero.claims, (claim) => claim.text).map(
                ({ item, key }) => (
                  <li
                    key={key}
                    className="flex items-center gap-2.5 text-sm font-medium text-ink"
                  >
                    <Check
                      aria-hidden
                      className="size-4 text-primary"
                      strokeWidth={2.25}
                    />
                    {item.text}
                  </li>
                ),
              )}
            </ul>
          </div>
          {/*
            Artwork bleeds to the bottom of the hero and, on desktop, past the
            content edge. Lazy by default so phones, where it is hidden, never
            download it; the left edge is feathered to hide the crop seam.
          */}
          <Image
            src={hero.image || "/images/join/hero-electrician.jpg"}
            alt={hero.image_alt}
            width={667}
            height={659}
            fetchPriority="high"
            sizes="(min-width: 1024px) 667px, 460px"
            className="mx-auto hidden h-auto w-full max-w-[460px] self-end [mask-image:linear-gradient(to_right,transparent,black_16px)] sm:block lg:mx-0 lg:w-[calc(100%+97px)] lg:max-w-none"
          />
        </Container>
      </section>

      {/* Benefits */}
      <Section
        tone="mint"
        aria-labelledby="benefits-heading"
        className="lg:py-26"
      >
        <Container>
          <h2 id="benefits-heading" className="sr-only">
            Why electricians join PickASparky
          </h2>
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {keyed(benefits.items, (item) => item.title).map(
              ({ item: benefit, key }, index) => (
                <li key={key} className="lg:px-6">
                  <IconBadge
                    icon={benefitStyles[index % benefitStyles.length].icon}
                    tone={benefitStyles[index % benefitStyles.length].tone}
                    size="lg"
                    className="text-ink"
                  />
                  <h3 className="mt-6 text-xl font-extrabold leading-7 lg:mt-8">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-5 lg:max-w-[250px]">
                    {benefit.text}
                  </p>
                </li>
              ),
            )}
          </ul>
        </Container>
      </Section>

      {/* Steps */}
      <Section
        aria-labelledby="steps-heading"
        className="pb-8 md:pt-[88px] md:pb-12"
      >
        <Container>
          <SectionHeading
            id="steps-heading"
            title={steps.title}
            lead={steps.lead}
          />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-6">
            {keyed(steps.items, (item) => item.title).map(
              ({ item: step, key }, index) => {
                const StepIcon = stepIcons[index % stepIcons.length];
                return (
                  <li
                    key={key}
                    className="rounded-2xl border border-line bg-white p-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <StepNumber>{index + 1}</StepNumber>
                      <StepIcon
                        aria-hidden
                        className="size-9 text-ink"
                        strokeWidth={1.75}
                      />
                    </div>
                    <h3 className="mt-8 text-xl font-extrabold leading-7 tracking-[-0.01em]">
                      {step.title}
                    </h3>
                    <p className="mt-6 text-sm leading-5">{step.text}</p>
                  </li>
                );
              },
            )}
          </ol>
        </Container>
      </Section>

      {/* Work types */}
      <Section aria-labelledby="work-heading" className="pt-8 pb-12 md:pt-11">
        <Container>
          <SectionHeading
            id="work-heading"
            title={work.title}
            lead={work.lead}
          />
          {/* This design sets the column titles smaller than the shared default so each fits on one line. */}
          <IconColumns
            items={work.items.map((item, index) => ({
              ...workStyles[index % workStyles.length],
              title: item.title,
              text: item.text,
            }))}
            className="mt-8 md:mt-10 lg:[&_h3]:text-sm"
          />
        </Container>
      </Section>

      {/* Membership */}
      <Section
        tone="mint"
        aria-labelledby="plans-heading"
        className="md:pt-[88px]"
      >
        <Container>
          <SectionHeading
            id="plans-heading"
            title={content.plans.title}
            lead={content.plans.lead}
          />
          <PricingCards className="mt-10" />
        </Container>
      </Section>

      {/* FAQ */}
      <Section aria-labelledby="faq-heading">
        <Container>
          <h2
            id="faq-heading"
            className="text-2xl font-extrabold tracking-[-0.01em] sm:text-[28px]"
          >
            {faq.title}
          </h2>
          <FaqList
            items={faq.items}
            columns={2}
            withSchema
            className="mt-7 gap-4 md:gap-x-6 [&_summary]:py-4 [&_summary]:text-[15px] [&_summary]:leading-6 sm:[&_summary]:text-base"
          />
        </Container>
      </Section>

      <ClosingSection page="join" />

      <LocationsDirectory />

      <PageSchema
        title={seo.title}
        description={seo.description}
        path={routes.join}
        crumb="Join as an Installer"
      />
      <JsonLd data={membershipSchema(seo.description)} />
    </>
  );
}
