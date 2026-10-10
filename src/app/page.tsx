import { ArrowRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { QuoteComparisonArt } from "@/components/home/quote-comparison-art";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { InstallerLogo } from "@/components/sections/installer-card";
import { JsonLd } from "@/components/sections/json-ld";
import { PageSchema } from "@/components/sections/page-schema";
import { PostcodeCard } from "@/components/sections/postcode-card";
import { PostcodeForm } from "@/components/sections/postcode-form";
import { ReviewsMarquee } from "@/components/sections/reviews";
import { ButtonLink } from "@/components/ui/button";
import { CheckBullet, ShieldTick } from "@/components/ui/icon-badge";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/layout";
import { StarRating } from "@/components/ui/star-rating";
import { api } from "@/lib/api";
import { pageMetadata, serviceSchema } from "@/lib/seo";
import { installerPath, routes } from "@/lib/site";

const page = {
  title: "Compare EV Charger Installer Quotes in the UK",
  description:
    "Find trusted, vetted EV charger installers near you. Enter your postcode, compare up to 5 free quotes and choose the right electrician. No obligation.",
  path: routes.home,
};

export const metadata: Metadata = {
  ...pageMetadata(page),
  title: {
    absolute: "PickASparky | Compare EV Charger Installer Quotes in the UK",
  },
};

const installTypes = [
  {
    title: "Home EV charger installation",
    text: "Convenient charging at home",
    image: "/images/home/install-type-1.jpg",
    alt: "Electric car charging from a wall-mounted home charger",
    type: "new_home",
  },
  {
    title: "Replace an existing EV charger",
    text: "Upgrade to a newer, smarter charger",
    image: "/images/home/install-type-2.jpg",
    alt: "Hand plugging a cable into a wall-mounted EV charger",
    type: "replace_existing",
  },
  {
    title: "Commercial EV charging",
    text: "For businesses, fleets and workplaces",
    image: "/images/home/install-type-3.jpg",
    alt: "Driver using a phone beside a commercial EV charge point",
    type: "workplace_commercial",
  },
  {
    title: "Workplace EV charging",
    text: "For your team and company vehicles",
    image: "/images/home/install-type-4.jpg",
    alt: "Person holding an EV charging connector next to a car",
    type: "workplace_commercial",
  },
] as const;

const guides = [
  {
    title: "EV charger installation costs in the UK",
    text: "Find out what affects the cost and what to expect.",
    image: "/images/home/guide-1.jpg",
  },
  {
    title: "Best home EV chargers for 2026",
    text: "Compare popular models and key features.",
    image: "/images/home/guide-2.jpg",
  },
  {
    title: "7kW vs 22kW chargers",
    text: "Which charging speed is right for your home or business?",
    image: "/images/home/guide-3.jpg",
  },
  {
    title: "EV charger grants in the UK",
    text: "See what financial support may be available and how to apply.",
    image: "/images/home/guide-4.jpg",
  },
];

const reasons = [
  "Trusted, vetted installers",
  "Real customer reviews",
  "Compare up to 5 quotes",
  "Simple and secure",
  "Supporting the UK's transition to cleaner transport",
];

export default async function HomePage() {
  const [reviews, featured] = await Promise.all([
    api.featuredReviews(10),
    api.installers({ featured: true, pageSize: 1 }),
  ]);
  const spotlight = featured?.items[0];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface to-white">
        <Container
          size="narrow"
          className="py-20 text-center sm:py-28 lg:pt-[168px] lg:pb-[176px]"
        >
          <h1 className="text-[34px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-5xl sm:leading-[1.17]">
            Find trusted <br />
            EV charger installers <br />
            <span className="text-primary">Compare up to 5 quotes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-relaxed">
            Enter your postcode and we&apos;ll connect you with trusted, local
            EV charger installers. It&apos;s free and there&apos;s no
            obligation.
          </p>
          <PostcodeCard
            id="hero-postcode"
            className="mx-auto mt-8 max-w-[672px]"
          />
        </Container>
      </section>

      {/* Installation types */}
      <Section spacing="sm" aria-labelledby="types-heading" className="md:pt-8">
        <Container size="narrow">
          <SectionHeading
            id="types-heading"
            eyebrow="Popular installation types"
            title="What do you need an EV charger for?"
            weight="bold"
          />
          <ul className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {installTypes.map((item) => (
              <li key={item.title}>
                <Link
                  href={`${routes.quotes}?type=${item.type}`}
                  className="group relative block aspect-[261/208] overflow-hidden rounded-2xl bg-ink"
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 262px, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 via-35% to-transparent to-70%" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-5">
                    <span>
                      <span className="block text-[13px] font-medium leading-tight text-white sm:text-[15px]">
                        {item.title}
                      </span>
                      <span className="mt-1.5 hidden text-xs leading-snug text-white/80 sm:block">
                        {item.text}
                      </span>
                    </span>
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform group-hover:translate-x-0.5 sm:size-9">
                      <ArrowRight aria-hidden className="size-4" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Why choose */}
      <Section spacing="sm" aria-labelledby="why-heading">
        <Container size="narrow">
          <SectionHeading
            id="why-heading"
            title="Why choose PickASparky?"
            weight="bold"
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="flex min-w-0 flex-col justify-between gap-10 rounded-2xl bg-mint p-5 sm:p-8">
              <QuoteComparisonArt />
              <div>
                <Eyebrow className="mb-2">Compare quotes</Eyebrow>
                <h3 className="text-2xl font-bold sm:text-[28px]">
                  Get up to 5 quotes
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed">
                  Tell us what you need and receive up to 5 quotes from trusted,
                  local EV charger installers.
                </p>
                <ButtonLink
                  href={routes.quotes}
                  variant="dark"
                  className="mt-6"
                >
                  Get Your Quotes
                </ButtonLink>
              </div>
            </div>

            <div className="grid min-w-0 gap-5">
              <div className="relative overflow-hidden rounded-2xl bg-sand">
                <div className="relative z-10 max-w-[64%] p-5 sm:max-w-[62%] sm:p-6">
                  <Eyebrow className="mb-2">Trusted installers</Eyebrow>
                  <h3 className="text-2xl font-bold leading-[1.1] sm:text-[28px]">
                    Verified &amp; reviewed installers
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed">
                    We only work with qualified, experienced and reviewed
                    electricians.
                  </p>
                  <ButtonLink
                    href={routes.installers}
                    variant="dark"
                    className="mt-6"
                  >
                    Find an Installer
                  </ButtonLink>
                </div>
                <div className="absolute inset-y-0 right-0 w-[40%]">
                  <Image
                    src="/images/home/verified-installers.jpg"
                    alt="Electric car driving on an open road"
                    fill
                    sizes="(min-width: 1024px) 220px, 40vw"
                    className="object-cover [mask-image:linear-gradient(to_right,transparent,black_30%)]"
                  />
                  <ShieldTick className="absolute top-7 -left-8 hidden size-14 drop-shadow-md sm:block" />
                  <p className="absolute top-[41%] -left-11 hidden rounded-lg bg-white px-3 py-2 text-[11px] font-semibold leading-snug text-ink shadow-card sm:block">
                    NAPIT / NICEIC
                    <br />
                    Registered
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-peach p-5 sm:p-6 sm:pl-8">
                <div>
                  <Eyebrow className="mb-2">Local to you</Eyebrow>
                  <h3 className="text-2xl font-bold leading-[1.1] sm:text-[28px]">
                    Find installers near you
                  </h3>
                  <p className="mt-4 max-w-[280px] text-[15px] leading-relaxed">
                    We match you with local EV charger installers in your area
                    for a faster, more convenient service.
                  </p>
                  <ButtonLink
                    href={routes.installers}
                    variant="dark"
                    className="mt-6"
                  >
                    Search in Your Area
                  </ButtonLink>
                </div>
                <Image
                  src="/images/home/local-map.png"
                  alt="Map with pins showing nearby EV charger installers"
                  width={206}
                  height={236}
                  className="hidden h-auto w-[36%] max-w-[206px] shrink-0 rounded-xl min-[420px]:block"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Guides */}
      <Section spacing="sm" aria-labelledby="guides-heading">
        <Container size="narrow">
          <SectionHeading
            id="guides-heading"
            eyebrow="EV charger guides"
            title="Helpful guides for your EV journey"
            weight="bold"
          />
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {guides.map((guide) => (
              <li
                key={guide.title}
                className="flex gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft"
              >
                <Image
                  src={guide.image}
                  alt=""
                  width={96}
                  height={130}
                  className="h-[130px] w-24 shrink-0 rounded-lg object-cover"
                />
                <div className="py-1.5">
                  <h3 className="text-sm font-semibold leading-snug">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed">
                    {guide.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Request a quote + coverage map */}
      <Section
        tone="mint"
        spacing="sm"
        aria-labelledby="request-heading"
        className="overflow-hidden"
      >
        <Container
          size="narrow"
          className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] lg:gap-6"
        >
          <div>
            <Eyebrow className="mb-4">Local EV charger installers</Eyebrow>
            <h2
              id="request-heading"
              className="text-[30px] font-bold leading-[1.08] sm:text-[38px]"
            >
              Request Quote from Vetted Installers
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed">
              Tell us where you are and compare quotes from trusted EV charger
              installers in your area.
            </p>
            <PostcodeForm
              id="map-postcode"
              variant="inline"
              buttonLabel="Search Installers"
              className="mt-6 max-w-[380px]"
            />
          </div>

          <div className="relative mx-auto w-full max-w-[270px] lg:-my-10">
            <Image
              src="/images/home/uk-map.svg"
              alt="Map of the United Kingdom showing cities covered by PickASparky installers"
              width={360}
              height={560}
              unoptimized
              className="h-auto w-full"
            />
            {spotlight ? (
              <article className="absolute top-[36%] left-1/2 flex w-[264px] -translate-x-1/2 items-center gap-3 rounded-xl bg-white p-3 shadow-float">
                <InstallerLogo
                  name={spotlight.business_name}
                  logoUrl={spotlight.logo_url}
                  size={76}
                />
                <div className="min-w-0 text-[13px]">
                  <h3 className="truncate text-sm font-semibold">
                    {spotlight.business_name}
                  </h3>
                  {spotlight.rating_avg !== null ? (
                    <>
                      <StarRating
                        rating={spotlight.rating_avg}
                        size="sm"
                        className="mt-1"
                      />
                      <p className="mt-0.5">
                        {spotlight.rating_avg.toFixed(1)} (
                        {spotlight.review_count}{" "}
                        {spotlight.review_count === 1 ? "review" : "reviews"})
                      </p>
                    </>
                  ) : null}
                  <p className="flex items-center gap-1">
                    <MapPin aria-hidden className="size-3" />
                    {spotlight.town}
                  </p>
                  <Link
                    href={installerPath(spotlight.slug)}
                    className="mt-1 inline-flex items-center gap-1 font-semibold text-primary"
                  >
                    View profile <ArrowRight aria-hidden className="size-3" />
                  </Link>
                </div>
              </article>
            ) : null}
          </div>

          <div className="rounded-2xl bg-white p-7 shadow-float">
            <h3 className="text-xl font-semibold leading-snug">
              Why choose PickASparky?
            </h3>
            <ul className="mt-5 space-y-4">
              {reasons.map((reason) => (
                <li key={reason} className="flex gap-3 text-[15px] text-ink">
                  <CheckBullet className="mt-0.5" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <ReviewsMarquee reviews={reviews} />
      <LocationsDirectory />

      <PageSchema {...page} />
      <JsonLd
        data={serviceSchema({
          name: "EV charger installer quote comparison",
          description:
            "Free service that matches UK homeowners and businesses with up to 5 vetted, local EV charger installers.",
          path: routes.home,
        })}
      />
    </>
  );
}
