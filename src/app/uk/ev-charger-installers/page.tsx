import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  FileText,
  Home,
  PlugZap,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LocationsIndex } from "@/components/directory/locations-index";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { Breadcrumbs } from "@/components/sections/breadcrumbs";
import { ClosingSection } from "@/components/sections/closing-section";
import { FaqList } from "@/components/sections/faq";
import { JsonLd } from "@/components/sections/json-ld";
import { PageSchema } from "@/components/sections/page-schema";
import { PostcodeForm } from "@/components/sections/postcode-form";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/layout";
import { api } from "@/lib/api";
import { getContent } from "@/lib/content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { blogPostPath, locationPath, routes } from "@/lib/site";
import { keyed } from "@/lib/utils";

// The list of locations changes rarely; refresh it hourly.
export const revalidate = 3600;

/** The seeded guide the "Need help choosing?" card points to. */
const CHOOSING_GUIDE = blogPostPath(
  "how-to-choose-a-qualified-ev-charger-installer",
);

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("installers-hub");
  return pageMetadata({ ...seo, path: routes.installers });
}

/*
 * Icons pair with the editable cards by position (the editor keeps these lists
 * at a fixed length for that reason).
 */
const trustIcons = [
  { icon: ShieldCheck, tone: "green" },
  { icon: FileText, tone: "coral" },
  { icon: Users, tone: "blue" },
] as const;

const choosingIcons = [
  { icon: Check, tone: "green" },
  { icon: Settings, tone: "blue" },
  { icon: FileText, tone: "coral" },
  { icon: BadgeCheck, tone: "mint" },
] as const;

const serviceIcons = [
  { icon: Home, tone: "blue" },
  { icon: Building2, tone: "sky" },
  { icon: RefreshCw, tone: "green" },
  { icon: PlugZap, tone: "mint" },
] as const;

/**
 * The hub for EV charger installers: every town and city with its installer
 * count, how to choose an installer, the services covered and FAQs. It stays
 * the landing page for this trade when the home page broadens to other trades.
 */
export default async function InstallersHubPage() {
  const [locations, content] = await Promise.all([
    api.locations(),
    getContent("installers-hub"),
  ]);
  const { seo, hero, trust, towns, choosing, services, faq } = content;

  return (
    <>
      {/* Hero: copy and postcode search on the left, photo on the right */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface to-white">
        <div
          aria-hidden
          className="absolute top-[-120px] right-[24%] hidden size-[420px] rounded-full bg-mint-soft lg:block"
        />
        <div className="absolute inset-y-0 right-0 hidden w-[36%] overflow-hidden rounded-bl-[240px] lg:block">
          <Image
            src={hero.image || "/images/home/install-type-3.jpg"}
            alt={hero.image_alt}
            fill
            priority
            sizes="36vw"
            className="object-cover"
          />
        </div>
        <Container className="relative pt-5 pb-12 md:pb-[180px]">
          <Breadcrumbs
            items={[
              { name: "Home", path: routes.home },
              { name: "EV Charger Installers", path: routes.installers },
            ]}
          />
          <div className="mt-8 max-w-[620px] md:mt-12 lg:max-w-[58%]">
            <Eyebrow className="mb-2">{hero.eyebrow}</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-[-0.01em] sm:text-[40px] md:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              {hero.lead}
            </p>
            <PostcodeForm id="hub-postcode" className="mt-8 max-w-[560px]" />
          </div>
        </Container>
      </section>

      {/* Trust strip */}
      <section
        aria-label="Why use PickASparky"
        className="border-y border-line"
      >
        <Container>
          <ul className="grid grid-cols-1 divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {keyed(trust.items, (item) => item.title).map(
              ({ item, key }, index) => {
                const { icon, tone } = trustIcons[index % trustIcons.length];
                return (
                  <li
                    key={key}
                    className="flex items-center gap-4 py-6 md:px-6 md:first:pl-0 md:last:pr-0 lg:px-10"
                  >
                    <IconBadge icon={icon} tone={tone} />
                    <div>
                      <h2 className="text-[15px] font-semibold text-ink">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-[13px] leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </li>
                );
              },
            )}
          </ul>
        </Container>
      </section>

      {/* Towns and cities, grouped by region */}
      <LocationsIndex
        locations={locations}
        title={towns.title}
        lead={towns.lead}
      />

      {/* How to choose */}
      <Section tone="mint" aria-labelledby="choosing-heading">
        <Container>
          <SectionHeading
            id="choosing-heading"
            title={choosing.title}
            lead={choosing.lead}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.15fr)]">
            {keyed(choosing.cards, (item) => item.title).map(
              ({ item, key }, index) => {
                const { icon, tone } =
                  choosingIcons[index % choosingIcons.length];
                return (
                  <article
                    key={key}
                    className="rounded-2xl bg-white p-5 shadow-soft"
                  >
                    <IconBadge icon={icon} tone={tone} />
                    <h3 className="mt-5 text-base font-bold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed">
                      {item.text}
                    </p>
                  </article>
                );
              },
            )}
            <aside className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-extrabold tracking-[-0.01em] text-ink">
                {choosing.help_title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed">
                {choosing.help_text}
              </p>
              <Link
                href={CHOOSING_GUIDE}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 text-sm font-semibold text-ink transition-colors hover:bg-primary hover:text-white lg:mt-auto"
              >
                {choosing.help_button}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Services */}
      <Section aria-labelledby="services-heading">
        <Container>
          <SectionHeading
            id="services-heading"
            title={services.title}
            lead={services.lead}
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {keyed(services.cards, (item) => item.title).map(
              ({ item, key }, index) => {
                const { icon, tone } =
                  serviceIcons[index % serviceIcons.length];
                return (
                  <li
                    key={key}
                    className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft"
                  >
                    <IconBadge icon={icon} tone={tone} />
                    <div>
                      <h3 className="text-[15px] font-bold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </li>
                );
              },
            )}
          </ul>
          <p className="mt-8 flex items-center gap-2 text-sm">
            <Zap aria-hidden className="size-4 text-primary" />
            <Link
              href={routes.quotes}
              className="font-semibold text-primary hover:underline"
            >
              {services.link}
            </Link>
          </p>
        </Container>
      </Section>

      {/* FAQs */}
      <Section tone="surface" aria-labelledby="hub-faq-heading">
        <Container>
          <SectionHeading
            id="hub-faq-heading"
            title={faq.title}
            lead={faq.lead}
          />
          <FaqList items={faq.items} columns={2} withSchema className="mt-10" />
        </Container>
      </Section>

      <ClosingSection page="installers-hub" />

      <LocationsDirectory />

      <PageSchema
        title={seo.title}
        description={seo.description}
        path={routes.installers}
        type="CollectionPage"
      />
      {locations.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "EV charger installers by UK location",
            numberOfItems: locations.length,
            itemListElement: locations.map((location, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `EV charger installers in ${location.name}`,
              url: absoluteUrl(locationPath(location.slug)),
            })),
          }}
        />
      ) : null}
    </>
  );
}
