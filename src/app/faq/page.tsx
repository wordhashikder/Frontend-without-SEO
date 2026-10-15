import { HardHat, House, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { ClosingSection } from "@/components/sections/closing-section";
import { type FaqItem, FaqList } from "@/components/sections/faq";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Eyebrow } from "@/components/ui/layout";
import { getContent } from "@/lib/content";
import { faqEntities, pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("faq");
  return pageMetadata({ ...seo, path: routes.faq });
}

/** The hero's "get in touch" (if the wording keeps it) links to the contact page. */
function withContactLink(text: string) {
  const phrase = "get in touch";
  const at = text.toLowerCase().indexOf(phrase);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <Link
        href={routes.contact}
        className="text-primary underline-offset-4 hover:underline"
      >
        {text.slice(at, at + phrase.length)}
      </Link>
      {text.slice(at + phrase.length)}
    </>
  );
}

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

export default async function FaqPage() {
  const { seo, hero, homeowners, electricians } = await getContent("faq");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
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
          {withContactLink(hero.lead)}
        </p>
      </PageHero>

      <Container className="space-y-16 pb-14 md:space-y-20 md:pb-20">
        <FaqGroup
          id="for-homeowners"
          icon={House}
          badgeClassName="bg-peach text-ink"
          eyebrow={homeowners.eyebrow}
          title={homeowners.title}
          lead={homeowners.lead}
          items={homeowners.items}
        />
        <FaqGroup
          id="for-electricians"
          icon={HardHat}
          badgeClassName="bg-mint-soft text-ink"
          eyebrow={electricians.eyebrow}
          title={electricians.title}
          lead={electricians.lead}
          items={electricians.items}
        />
      </Container>

      <ClosingSection page="faq" />

      <LocationsDirectory />

      <PageSchema
        title={seo.title}
        description={seo.description}
        path={routes.faq}
        type="FAQPage"
        crumb="FAQ"
        extra={{
          mainEntity: faqEntities([...homeowners.items, ...electricians.items]),
        }}
      />
    </>
  );
}
