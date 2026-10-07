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
import { joinFaqs } from "@/content/faqs";
import { plans } from "@/content/plans";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";

const lowestPaidPrice = Math.min(
  ...plans.filter((plan) => plan.price > 0).map((plan) => plan.price),
);

const description = `Join PickASparky to get enquiries from homeowners looking for vetted electricians in your area. Free listing, plans from £${lowestPaidPrice} a month, no long-term contracts.`;

const page = {
  title: "Electrician Leads: Join as an Installer",
  description,
  path: routes.join,
};

export const metadata: Metadata = pageMetadata(page);

const heroClaims = [
  "Quality, local enquiries",
  "No long-term contracts",
  "Easy to get started",
];

const benefits = [
  {
    icon: UsersRound,
    tone: "green",
    title: "Reach local customers",
    text: "Get enquiries from homeowners in your area who are actively looking for an electrician.",
  },
  {
    icon: Target,
    tone: "peach",
    title: "Quality, relevant leads",
    text: "Receive genuine enquiries that match your services and location.",
  },
  {
    icon: Settings,
    tone: "green",
    title: "You stay in control",
    text: "Choose the types of jobs you receive and when you're available to take on new work.",
  },
  {
    icon: ChartNoAxesColumn,
    tone: "green",
    title: "Grow your business",
    text: "A simple and affordable way to get more work and build your reputation.",
  },
] as const;

const steps = [
  {
    icon: FileText,
    title: "Create your profile",
    text: "Tell us about your business, services, coverage areas and accreditations.",
  },
  {
    icon: CircleCheck,
    title: "Get verified",
    text: "We review your information to make sure you're a qualified and legitimate electrician.",
  },
  {
    icon: Mail,
    title: "Start receiving enquiries",
    text: "Get notified when homeowners in your area request quotes for electrical work.",
  },
  {
    icon: HeartHandshake,
    title: "Win more work",
    text: "Contact interested customers, provide your quote and grow your business.",
  },
];

const workTypes = [
  {
    icon: House,
    tone: "coral",
    title: "Domestic electrical work",
    text: "Rewiring, lighting, consumer units and more.",
  },
  {
    icon: Wrench,
    tone: "blue",
    title: "EV charger installations",
    text: "Home and commercial EV charging points.",
  },
  {
    icon: Zap,
    tone: "green",
    title: "Electrical repairs",
    text: "Fault finding and safe repairs.",
  },
  {
    icon: Building2,
    tone: "sky",
    title: "Commercial projects",
    text: "Offices, shops, landlords and more.",
  },
  {
    icon: Settings,
    tone: "violet",
    title: "Additional services",
    text: "Solar PV, battery storage, smart home installations and more.",
  },
] satisfies ComponentProps<typeof IconColumns>["items"];

/** Memberships as schema.org offers; prices come from the same data as the cards. */
const membershipSchema = {
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
};

export default function JoinPage() {
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden">
        <Container className="grid lg:grid-cols-[minmax(0,620fr)_minmax(0,570fr)] lg:gap-[30px]">
          <div className="pt-12 pb-10 md:py-20">
            <Eyebrow className="mb-2">Join as an electrician</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[1.25] tracking-[-0.01em] sm:text-[40px] md:text-5xl md:leading-[1.45] xl:[text-wrap:wrap]">
              Get more qualified <br className="hidden xl:block" />
              leads for your electrical business
            </h1>
            <p className="mt-3 max-w-[600px] text-base leading-relaxed sm:text-xl sm:leading-[1.6] md:text-[22px] md:leading-8">
              Join PickASparky and receive enquiries from homeowners looking for
              trusted, vetted electricians in your area. It&apos;s a simple and
              cost-effective way to grow your business.
            </p>
            <ButtonLink
              href={routes.register}
              size="lg"
              arrow
              className="mt-8 md:mt-10"
            >
              Join as an Installer
            </ButtonLink>
            <ul className="mt-4 flex flex-col gap-x-7 gap-y-2.5 sm:flex-row sm:flex-wrap">
              {heroClaims.map((claim) => (
                <li
                  key={claim}
                  className="flex items-center gap-2.5 text-sm font-medium text-ink"
                >
                  <Check
                    aria-hidden
                    className="size-4 text-primary"
                    strokeWidth={2.25}
                  />
                  {claim}
                </li>
              ))}
            </ul>
          </div>
          {/*
            Artwork bleeds to the bottom of the hero and, on desktop, past the
            content edge. Lazy by default so phones, where it is hidden, never
            download it; the left edge is feathered to hide the crop seam.
          */}
          <Image
            src="/images/join/hero-electrician.jpg"
            alt="Smiling electrician in a hard hat with examples of new customer enquiries"
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
            {benefits.map((benefit) => (
              <li key={benefit.title} className="lg:px-6">
                <IconBadge
                  icon={benefit.icon}
                  tone={benefit.tone}
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
            ))}
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
            title="How it works"
            lead="Getting started is quick and easy. Here's how it works:"
          />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-line bg-white p-4"
              >
                <div className="flex items-center gap-3.5">
                  <StepNumber>{index + 1}</StepNumber>
                  <step.icon
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
            ))}
          </ol>
        </Container>
      </Section>

      {/* Work types */}
      <Section aria-labelledby="work-heading" className="pt-8 pb-12 md:pt-11">
        <Container>
          <SectionHeading
            id="work-heading"
            title="What types of work can you receive?"
            lead="Choose the types of electrical work you want to receive enquiries for."
          />
          {/* This design sets the column titles smaller than the shared default so each fits on one line. */}
          <IconColumns
            items={workTypes}
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
            title="Membership options"
            lead="Choose the plan that works for your business. Simple and transparent pricing."
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
            Frequently asked questions
          </h2>
          <FaqList
            items={joinFaqs}
            columns={2}
            withSchema
            className="mt-7 gap-4 md:gap-x-6 [&_summary]:py-4 [&_summary]:text-[15px] [&_summary]:leading-6 sm:[&_summary]:text-base"
          />
        </Container>
      </Section>

      <LocationsDirectory />

      <PageSchema {...page} crumb="Join as an Installer" />
      <JsonLd data={membershipSchema} />
    </>
  );
}
