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
import {
  hubChoosing,
  hubFaqs,
  hubServices,
  hubTrust,
} from "@/content/installers-hub";
import { api } from "@/lib/api";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { blogPostPath, locationPath, routes } from "@/lib/site";

// The list of locations changes rarely; refresh it hourly.
export const revalidate = 3600;

const page = {
  title: "EV Charger Installers Near You",
  description:
    "Find EV charger installers near you. Browse vetted local electricians by UK town or city, or enter your postcode to compare up to 5 free quotes.",
  path: routes.installers,
};

/** The seeded guide the "Need help choosing?" card points to. */
const CHOOSING_GUIDE = blogPostPath(
  "how-to-choose-a-qualified-ev-charger-installer",
);

export const metadata: Metadata = pageMetadata(page);

const trustIcons = {
  vetted: { icon: ShieldCheck, tone: "green" },
  quotes: { icon: FileText, tone: "coral" },
  local: { icon: Users, tone: "blue" },
} as const;

const choosingIcons = {
  qualifications: { icon: Check, tone: "green" },
  experience: { icon: Settings, tone: "blue" },
  quotes: { icon: FileText, tone: "coral" },
  insurance: { icon: BadgeCheck, tone: "mint" },
} as const;

const serviceIcons = {
  home: { icon: Home, tone: "blue" },
  workplace: { icon: Building2, tone: "sky" },
  replacement: { icon: RefreshCw, tone: "green" },
  commercial: { icon: PlugZap, tone: "mint" },
} as const;

/**
 * The hub for EV charger installers: every town and city with its installer
 * count, how to choose an installer, the services covered and FAQs. It stays
 * the landing page for this trade when the home page broadens to other trades.
 */
export default async function InstallersHubPage() {
  const locations = await api.locations();

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
            src="/images/home/install-type-3.jpg"
            alt="Home EV charger mounted on a wall beside a parked electric car"
            fill
            priority
            sizes="36vw"
            className="object-cover"
          />
        </div>
        <Container className="relative pt-5 pb-12 md:pb-16">
          <Breadcrumbs
            items={[
              { name: "Home", path: routes.home },
              { name: "EV Charger Installers", path: routes.installers },
            ]}
          />
          <div className="mt-8 max-w-[620px] md:mt-12 lg:max-w-[58%]">
            <Eyebrow className="mb-2">EV charger installers</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-[-0.01em] sm:text-[40px] md:text-5xl">
              Find EV charger installers near you
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              Choose your nearest town or city, or enter your postcode to see
              trusted, vetted EV charger installers who cover your area.
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
            {hubTrust.map((item) => {
              const { icon, tone } = trustIcons[item.key];
              return (
                <li
                  key={item.key}
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
            })}
          </ul>
        </Container>
      </section>

      {/* Towns and cities, grouped by region */}
      <LocationsIndex locations={locations} />

      {/* How to choose */}
      <Section tone="mint" aria-labelledby="choosing-heading">
        <Container>
          <SectionHeading
            id="choosing-heading"
            title="How to choose an EV charger installer"
            lead="A few things worth checking before you ask local electricians for quotes."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.15fr)]">
            {hubChoosing.map((item) => {
              const { icon, tone } = choosingIcons[item.key];
              return (
                <article
                  key={item.key}
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
            })}
            <aside className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-extrabold tracking-[-0.01em] text-ink">
                Need help choosing?
              </h3>
              <p className="mt-3 text-sm leading-relaxed">
                Our step-by-step guide explains what to ask an installer and how
                to read their quote.
              </p>
              <Link
                href={CHOOSING_GUIDE}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 text-sm font-semibold text-ink transition-colors hover:bg-primary hover:text-white lg:mt-auto"
              >
                View Guide
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
            title="EV charger installation services"
            lead="Installers on PickASparky cover every kind of charging job, from a single driveway to a full car park."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hubServices.map((item) => {
              const { icon, tone } = serviceIcons[item.key];
              return (
                <li
                  key={item.key}
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
            })}
          </ul>
          <p className="mt-8 flex items-center gap-2 text-sm">
            <Zap aria-hidden className="size-4 text-primary" />
            <Link
              href={routes.quotes}
              className="font-semibold text-primary hover:underline"
            >
              Get free quotes for your job
            </Link>
          </p>
        </Container>
      </Section>

      {/* FAQs */}
      <Section tone="surface" aria-labelledby="hub-faq-heading">
        <Container>
          <SectionHeading
            id="hub-faq-heading"
            title="Frequently asked questions"
            lead="Short answers about finding and choosing EV charger installers in the UK."
          />
          <FaqList items={hubFaqs} columns={2} withSchema className="mt-10" />
        </Container>
      </Section>

      <LocationsDirectory />

      <PageSchema {...page} type="CollectionPage" />
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
