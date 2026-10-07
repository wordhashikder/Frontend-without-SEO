import { HardHat, House, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { type FaqItem, FaqList } from "@/components/sections/faq";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Eyebrow } from "@/components/ui/layout";
import { homeownerFaqs, installerFaqs } from "@/content/faqs";
import { faqEntities, pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

const page = {
  title: "FAQs for Homeowners and Electricians",
  description:
    "Answers to common questions about PickASparky: free quotes for homeowners, how installers are vetted, how your details are shared and how electricians join.",
  path: routes.faq,
};

export const metadata: Metadata = pageMetadata(page);

type FaqGroupProps = {
  id: string;
  icon: LucideIcon;
  badgeClassName: string;
  eyebrow: string;
  title: string;
  lead: string;
  items: FaqItem[];
};

function FaqGroup({
  id,
  icon,
  badgeClassName,
  eyebrow,
  title,
  lead,
  items,
}: FaqGroupProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId}>
      <div className="flex items-start gap-4 sm:items-center sm:gap-6">
        <IconBadge
          icon={icon}
          size="lg"
          className={cn(
            "size-14 sm:size-[100px] [&>svg]:size-7 sm:[&>svg]:size-[52px]",
            badgeClassName,
          )}
        />
        <div>
          <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>
          <h2
            id={headingId}
            className="text-[22px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[28px]"
          >
            {title}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed sm:text-lg">{lead}</p>
        </div>
      </div>
      <FaqList
        items={items}
        className="mt-6 gap-4 [&_summary]:py-4 [&_summary]:text-[15px] [&_summary]:leading-6 sm:[&_summary]:text-base"
      />
    </section>
  );
}

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        image={{
          src: "/images/illustrations/faq.png",
          width: 163,
          height: 113,
          className: "hidden max-w-[163px] sm:block lg:mr-5 lg:max-w-[163px]",
        }}
        // The copy runs wider here than on other heroes, so the artwork takes only the room it needs.
        className="sm:[&>div]:grid-cols-[minmax(0,1fr)_auto] md:pt-[100px] md:pb-[92px]"
      >
        <p className="mt-3 max-w-[900px] text-base leading-relaxed sm:text-lg sm:leading-8">
          Find answers to common questions from homeowners and electricians. If
          you can&apos;t find what you&apos;re looking for, feel free to{" "}
          <Link
            href={routes.contact}
            className="text-primary underline-offset-4 hover:underline"
          >
            get in touch
          </Link>
          .
        </p>
      </PageHero>

      <Container className="space-y-16 pb-14 md:space-y-20 md:pb-20">
        <FaqGroup
          id="for-homeowners"
          icon={House}
          badgeClassName="bg-peach text-ink"
          eyebrow="For homeowners"
          title="Frequently asked questions for homeowners"
          lead="Everything you need to know about finding and comparing electricians through PickASparky."
          items={homeownerFaqs}
        />
        <FaqGroup
          id="for-electricians"
          icon={HardHat}
          badgeClassName="bg-mint-soft text-ink"
          eyebrow="For electricians"
          title="Frequently asked questions for electricians"
          lead="Learn more about joining PickASparky and how it works for electricians."
          items={installerFaqs}
        />
      </Container>

      <LocationsDirectory />

      <PageSchema
        {...page}
        type="FAQPage"
        crumb="FAQ"
        extra={{
          mainEntity: faqEntities([...homeownerFaqs, ...installerFaqs]),
        }}
      />
    </>
  );
}
