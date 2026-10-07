import { FileText, MapPin, ShieldCheck, User, Zap } from "lucide-react";
import Image from "next/image";
import {
  HowItWorksSteps,
  quoteSteps,
} from "@/components/directory/how-it-works-steps";
import { InstallerListing } from "@/components/directory/installer-listing";
import { Breadcrumbs } from "@/components/sections/breadcrumbs";
import { FeatureCard } from "@/components/sections/feature-blocks";
import { JsonLd } from "@/components/sections/json-ld";
import { PostcodeForm } from "@/components/sections/postcode-form";
import { ReviewsMarquee } from "@/components/sections/reviews";
import { ButtonLink } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/layout";
import {
  absoluteUrl,
  howToSchema,
  serviceSchema,
  webPageSchema,
} from "@/lib/seo";
import { installerPath, locationPath, routes } from "@/lib/site";
import type { InstallerCard, LocationDetail, Review } from "@/lib/types";

type LocationViewProps = {
  location: LocationDetail;
  /** The installers to list (cumulative across "Load More" pages). */
  installers: InstallerCard[];
  /** All installers covering this location. */
  total: number;
  page: number;
  reviews: Review[];
};

/** "Powering a greener {City}" card that sits over the location photo. */
function GreenerPill({ city }: { city: string }) {
  return (
    <p className="absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl bg-white p-3 pr-5 text-lg font-medium leading-[1.5] text-ink shadow-float sm:p-4 sm:pr-6 sm:text-xl">
      <span
        aria-hidden
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary sm:size-[60px]"
      >
        <Zap className="size-7 fill-current sm:size-9" strokeWidth={0} />
      </span>
      <span>
        Powering a greener <br />
        {city}
      </span>
    </p>
  );
}

/** Everything on a location page between the header and the locations directory. */
export function LocationView({
  location,
  installers,
  total,
  page,
  reviews,
}: LocationViewProps) {
  const city = location.name;
  const path = locationPath(location.slug);
  const steps = quoteSteps(city);
  const introParagraphs = location.intro
    ? location.intro.split(/\n\s*\n/).filter((text) => text.trim())
    : [
        `Whether you need a home charger, a workplace installation or a larger commercial solution, PickASparky helps you find trusted EV charger installers covering ${city} and the surrounding areas.`,
      ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Verified installers",
      text: "Local, qualified and reviewed electricians.",
      tone: "mint",
    },
    {
      icon: FileText,
      title: "Up to 5 quotes",
      text: "Compare quotes from trusted local installers.",
      tone: "peach",
    },
    {
      icon: MapPin,
      title: "Local expertise",
      text: `Installers who know ${city} and the surrounding areas.`,
      tone: "sand",
    },
    {
      icon: User,
      title: "You're in control",
      text: "It's free, with no obligation, and you choose who to contact.",
      tone: "mint",
    },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface to-white">
        <Container
          size="narrow"
          className="py-20 text-center sm:py-28 lg:pt-[168px] lg:pb-[84px]"
        >
          <h1 className="text-[34px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-5xl sm:leading-[1.17]">
            Find trusted <br className="max-sm:hidden" />
            EV charger installers in {city} <br />
            <span className="text-primary">Compare up to 5 quotes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-relaxed">
            Enter your postcode and we&apos;ll connect you with trusted, local
            EV charger installers. It&apos;s free and there&apos;s no
            obligation.
          </p>
          <PostcodeForm
            id="hero-postcode"
            className="mx-auto mt-8 max-w-[672px] text-left"
          />
        </Container>
      </section>

      {/* Installers */}
      <Section
        spacing="sm"
        aria-labelledby="installers-heading"
        className="md:pb-20"
      >
        <Container>
          <Breadcrumbs
            items={[
              { name: "Home", path: routes.home },
              { name: "EV Charger Installers", path: routes.installers },
              { name: city, path },
            ]}
          />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <SectionHeading
              id="installers-heading"
              eyebrow="Trusted local installers"
              title={`EV charger installers in ${city}`}
            />
            <ButtonLink
              href={routes.quotes}
              variant="link"
              arrow
              className="sm:mb-2"
            >
              Search Installers
            </ButtonLink>
          </div>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed">
            Here are some of the trusted EV charger installers covering {city}{" "}
            and surrounding areas.
          </p>
          <InstallerListing
            city={city}
            installers={installers}
            total={total}
            page={page}
            basePath={path}
          />
        </Container>
      </Section>

      <HowItWorksSteps city={city} steps={steps} />

      {/* Why choose + local block */}
      <Section aria-labelledby="why-heading" className="md:pt-24 md:pb-10">
        <Container>
          <SectionHeading
            id="why-heading"
            title={`Why choose PickASparky in ${city}?`}
          />
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {features.map((feature) => (
              <li key={feature.title}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  text={feature.text}
                  tone={feature.tone}
                  iconTone="green"
                  className="[&_h3]:lg:text-2xl [&_p]:lg:mt-6"
                />
              </li>
            ))}
          </ul>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="relative aspect-[598/282] min-h-[240px] w-full overflow-hidden rounded-2xl bg-mint lg:aspect-auto lg:min-h-[282px]">
              {location.image_url ? (
                <Image
                  src={location.image_url}
                  alt={`${city} skyline`}
                  fill
                  sizes="(min-width: 1024px) 598px, 100vw"
                  className="object-cover"
                />
              ) : null}
              <GreenerPill city={city} />
            </div>
            <div>
              <Eyebrow className="mb-2.5">EV charging in {city}</Eyebrow>
              <h2
                id="local-heading"
                className="text-2xl font-bold leading-tight tracking-[-0.01em] sm:text-[28px]"
              >
                EV charger installation in {city}
              </h2>
              <div className="mt-4 space-y-5 text-sm leading-[1.45]">
                {introParagraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
                <p>
                  Compare up to 5 quotes from qualified electricians in {city}{" "}
                  and find the right installer for your needs.
                </p>
              </div>
              <ButtonLink href={routes.quotes} variant="dark" className="mt-5">
                Search in Your Area
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <ReviewsMarquee reviews={reviews} />

      <JsonLd
        data={[
          webPageSchema({
            type: "CollectionPage",
            title: `EV Charger Installers in ${city}`,
            description: `Compare up to 5 free quotes from vetted EV charger installers in ${city}.`,
            path,
          }),
          serviceSchema({
            name: `EV charger installer quotes in ${city}`,
            description: `Free service that matches homeowners and businesses in ${city} with up to 5 vetted, local EV charger installers.`,
            path,
            areaServed: city,
          }),
          howToSchema({
            name: `How to get an EV charger installed in ${city}`,
            description: `Compare up to 5 free quotes from trusted EV charger installers in ${city} in three steps.`,
            steps: steps.map(({ name, text }) => ({ name, text })),
          }),
          ...(installers.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  name: `EV charger installers in ${city}`,
                  numberOfItems: installers.length,
                  itemListElement: installers.map((installer, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: installer.business_name,
                    url: absoluteUrl(installerPath(installer.slug)),
                  })),
                },
              ]
            : []),
        ]}
      />
    </>
  );
}
