import { FileText, MapPin, ShieldCheck, User, Zap } from "lucide-react";
import Image from "next/image";
import {
  HowItWorksSteps,
  quoteSteps,
} from "@/components/directory/how-it-works-steps";
import { InstallerListing } from "@/components/directory/installer-listing";
import { LocationMap } from "@/components/directory/location-map";
import { Breadcrumbs } from "@/components/sections/breadcrumbs";
import { ContentMarkdown } from "@/components/sections/content-markdown";
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
import type { PageContent } from "@/lib/content";
import {
  absoluteUrl,
  howToSchema,
  serviceSchema,
  webPageSchema,
} from "@/lib/seo";
import { installerPath, locationPath, routes } from "@/lib/site";
import type {
  InstallerCard,
  LocationDetail,
  LocationSummary,
  Review,
} from "@/lib/types";
import { keyed } from "@/lib/utils";

type LocationViewProps = {
  location: LocationDetail;
  /** The location page template, with {city} filled in. */
  content: PageContent<"location">;
  /** Other locations, for the neighbouring towns on the local map. */
  neighbours: LocationSummary[];
  /** The installers to list (cumulative across "Load More" pages). */
  installers: InstallerCard[];
  /** All installers covering this location. */
  total: number;
  page: number;
  reviews: Review[];
};

/** "Powering a greener {City}" card that sits over the location photo. */
function GreenerPill({ text, city }: { text: string; city: string }) {
  // The design breaks the line before the town's name.
  const before = text.endsWith(city) ? text.slice(0, -city.length).trim() : "";
  return (
    <p className="absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl bg-white p-3 pr-5 text-lg font-medium leading-[1.5] text-ink shadow-float sm:p-4 sm:pr-6 sm:text-xl">
      <span
        aria-hidden
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary sm:size-[60px]"
      >
        <Zap className="size-7 fill-current sm:size-9" strokeWidth={0} />
      </span>
      {before ? (
        <span>
          {before} <br />
          {city}
        </span>
      ) : (
        <span>{text}</span>
      )}
    </p>
  );
}

/**
 * The town's photo: one shipped with the site (public/images/locations/) or
 * one the admin uploaded, with its credit when there is one. Without a photo
 * the town's own local map is drawn instead, so no card is ever blank.
 */
function LocationPicture({
  location,
  neighbours,
}: Pick<LocationViewProps, "location" | "neighbours">) {
  if (location.image_url) {
    return (
      <>
        <Image
          src={location.image_url}
          alt={location.image_alt ?? `${location.name} city centre`}
          fill
          sizes="(min-width: 1280px) 598px, (min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        {location.image_credit ? (
          <p className="absolute top-3 right-3 max-w-[70%] truncate rounded-md bg-ink/60 px-2 py-0.5 text-[10px] leading-4 text-white">
            {location.image_credit}
          </p>
        ) : null}
      </>
    );
  }

  return (
    <LocationMap
      location={location}
      neighbours={neighbours}
      className="absolute inset-0 size-full"
    />
  );
}

/** Everything on a location page between the header and the locations directory. */
export function LocationView({
  location,
  content,
  neighbours,
  installers,
  total,
  page,
  reviews,
}: LocationViewProps) {
  const city = location.name;
  const path = locationPath(location.slug);
  const { hero, installers: listing, why, local } = content;
  const steps = quoteSteps(content.steps.items);
  // This location's own text (SEO & Locations) replaces the template's intro.
  const intro = location.intro?.trim() || local.intro;

  const featureStyles = [
    { icon: ShieldCheck, tone: "mint" },
    { icon: FileText, tone: "peach" },
    { icon: MapPin, tone: "sand" },
    { icon: User, tone: "mint" },
  ] as const;
  const features = keyed(why.cards, (card) => card.title).map(
    ({ item, key }, index) => ({
      ...featureStyles[index % featureStyles.length],
      key,
      title: item.title,
      text: item.text,
    }),
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface to-white">
        <Container
          size="narrow"
          className="py-20 text-center sm:py-28 lg:pt-[168px] lg:pb-[84px]"
        >
          <h1 className="text-[34px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-5xl sm:leading-[1.17]">
            {location.h1_heading ? (
              <>{location.h1_heading} </>
            ) : (
              <>
                {hero.line1} <br className="max-sm:hidden" />
                {hero.line2}{" "}
              </>
            )}
            <br />
            <span className="text-primary">{hero.highlight}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-relaxed">
            {hero.lead}
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
              eyebrow={listing.eyebrow}
              title={listing.title}
            />
            <ButtonLink
              href={routes.quotes}
              variant="link"
              arrow
              className="sm:mb-2"
            >
              {listing.search_link}
            </ButtonLink>
          </div>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed">
            {listing.lead}
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

      <HowItWorksSteps
        eyebrow={content.steps.eyebrow}
        title={content.steps.title}
        lead={content.steps.lead}
        steps={steps}
      />

      {/* Why choose + local block */}
      <Section aria-labelledby="why-heading" className="md:pt-24 md:pb-10">
        <Container>
          <SectionHeading id="why-heading" title={why.title} />
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {features.map((feature) => (
              <li key={feature.key}>
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
              <LocationPicture location={location} neighbours={neighbours} />
              <GreenerPill text={local.pill} city={city} />
            </div>
            <div>
              <Eyebrow className="mb-2.5">{local.eyebrow}</Eyebrow>
              <h2
                id="local-heading"
                className="text-2xl font-bold leading-tight tracking-[-0.01em] sm:text-[28px]"
              >
                {local.title}
              </h2>
              <ContentMarkdown className="mt-4">{intro}</ContentMarkdown>
              {local.closing ? (
                <p className="mt-5 text-sm leading-[1.45]">{local.closing}</p>
              ) : null}
              <ButtonLink href={routes.quotes} variant="dark" className="mt-5">
                {local.button}
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
            title: location.seo_title ?? content.seo.title,
            description: location.seo_description ?? content.seo.description,
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
