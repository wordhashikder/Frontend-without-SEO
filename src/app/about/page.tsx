import {
  ArrowRight,
  FileText,
  MapPin,
  Search,
  ShieldCheck,
  Users,
  UsersRound,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PhotoBanner } from "@/components/about/photo-banner";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { CtaBand } from "@/components/sections/cta-band";
import { FeatureCard } from "@/components/sections/feature-blocks";
import { PageSchema } from "@/components/sections/page-schema";
import { ButtonLink } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/layout";
import { pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";

const title = "About Us: The UK Electrician Marketplace";
const description =
  "PickASparky is an independent UK marketplace that helps homeowners and businesses find, compare and get quotes from suitable electricians in their area.";

const page = {
  title,
  description,
  path: routes.about,
};

export const metadata: Metadata = pageMetadata(page);

const differences = [
  {
    icon: FileText,
    iconTone: "coral",
    title: "Better information",
    text: "Useful electrician profiles instead of just a business name and phone number.",
  },
  {
    icon: MapPin,
    iconTone: "green",
    title: "Relevant matches",
    text: "Connect customers with electricians who provide the service you need and cover your area.",
  },
  {
    icon: ShieldCheck,
    iconTone: "green",
    title: "More transparency",
    text: "Make services, coverage and relevant accreditations easier to understand.",
  },
  {
    icon: Users,
    iconTone: "coral",
    title: "Customer control",
    text: "You decide who you want to contact and who you ultimately choose to hire.",
  },
] as const;

const schemeLogos = [
  { name: "NICEIC", src: "niceic.png", width: 134, height: 56 },
  { name: "NAPIT", src: "napit.png", width: 91, height: 117 },
  { name: "TrustMark", src: "trustmark.png", width: 145, height: 87 },
  { name: "MCS Certified", src: "mcs.png", width: 90, height: 100 },
];

const boundaries = [
  {
    icon: Wrench,
    title: "We don’t carry out electrical work",
    text: "PickASparky doesn’t provide electrical services and we don’t employ electricians.",
  },
  {
    icon: UsersRound,
    title: "We don’t choose an electrician for you",
    text: "You stay in control and decide who you want to contact and hire.",
  },
  {
    icon: Search,
    title: "We help you discover, compare and connect",
    text: "Our role is to make it easier to find suitable electricians and get the information you need.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PhotoBanner
        id="about-heading"
        as="h1"
        eyebrow="About PickASparky"
        title="Making it easier to find the right electrician"
        lead="PickASparky is an independent UK marketplace that connects homeowners and businesses with electricians. Our goal is to make it simpler to find, compare and get quotes from suitable electricians in your area."
        image={{
          src: "/images/about/hero-electrician.jpg",
          alt: "Smiling electrician on a stepladder fitting a ceiling light in a home",
        }}
        preload
        className="mt-6 lg:mt-10"
      />

      {/* Why we built PickASparky */}
      <Section aria-labelledby="why-heading">
        <Container className="grid items-start gap-8 sm:grid-cols-[minmax(0,294px)_minmax(0,1fr)] sm:gap-10">
          <Image
            src="/images/about/homeowner-searching.jpg"
            alt="Homeowner at a desk searching for an electrician on a laptop"
            width={294}
            height={248}
            sizes="(min-width: 640px) 294px, 100vw"
            className="h-auto w-full rounded-2xl"
          />
          <div>
            <Eyebrow className="mb-2">Why we built PickASparky</Eyebrow>
            <h2
              id="why-heading"
              className="text-[26px] font-extrabold leading-[1.3] tracking-[-0.02em] sm:text-[32px]"
            >
              Finding a good electrician shouldn’t be this difficult.
            </h2>
            <p className="mt-5 text-lg leading-relaxed sm:mt-6 lg:text-2xl lg:leading-[1.5]">
              Searching for an electrician often means checking multiple
              websites, contacting businesses one by one and trying to work out
              who covers your area and provides the service you need.
            </p>
          </div>
        </Container>
      </Section>

      {/* What we do differently */}
      <Section aria-labelledby="different-heading">
        <Container>
          <SectionHeading
            id="different-heading"
            eyebrow="What we’re trying to do differently"
            title="A more transparent and useful marketplace"
            size="lg"
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-6">
            {differences.map((item) => (
              <li key={item.title}>
                <FeatureCard
                  icon={item.icon}
                  iconTone={item.iconTone}
                  title={item.title}
                  text={item.text}
                  tone="sand"
                  className="bg-stone lg:min-h-[288px]"
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <PhotoBanner
        id="electricians-heading"
        eyebrow="Built for electricians too"
        title="Supporting independent electricians"
        lead="PickASparky helps electricians connect with customers looking for the services they provide in the areas they cover. It’s a straightforward way to showcase your business, share your services and reach relevant customers."
        image={{
          src: "/images/about/independent-electrician.jpg",
          alt: "Electrician working on the wiring of a consumer unit",
        }}
        contentClassName="lg:min-h-[552px] lg:py-20"
      >
        <ButtonLink href={routes.join} size="lg" arrow>
          Join PickASparky
        </ButtonLink>
      </PhotoBanner>

      {/* Trust and transparency */}
      <Section aria-labelledby="trust-heading">
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <Eyebrow className="mb-4">Trust &amp; transparency</Eyebrow>
            <h2
              id="trust-heading"
              className="text-[26px] font-extrabold leading-[1.3] tracking-[-0.02em] sm:text-[32px] sm:leading-[1.5]"
            >
              Making electrician information easier to understand
            </h2>
            <p className="mt-5 text-lg leading-relaxed sm:text-[22px] sm:leading-[1.5]">
              Electrician profiles can display relevant accreditations and
              registrations so you can make a more informed choice. We also
              explain what common accreditations mean, such as NICEIC, NAPIT,
              TrustMark and others.
            </p>
            <Link
              href={routes.accreditations}
              className="mt-7 inline-flex min-h-10 items-center gap-2.5 text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Learn about electrician accreditations
              <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
            </Link>
          </div>
          <ul
            aria-label="Accreditation schemes we explain"
            className="grid grid-cols-2 place-items-center gap-8 sm:flex sm:justify-between sm:gap-6"
          >
            {schemeLogos.map((logo) => (
              <li key={logo.name}>
                <Image
                  src={`/images/accreditations/${logo.src}`}
                  alt={`${logo.name} logo`}
                  width={logo.width}
                  height={logo.height}
                  className="h-auto max-w-full"
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Ready to find an electrician?"
        title="Get quotes from trusted electricians in your area"
        footnote={
          <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-semibold text-ink">
            Are you an electrician?
            <Link
              href={routes.join}
              className="inline-flex min-h-10 items-center gap-2 text-primary hover:text-primary-dark"
            >
              Join PickASparky
              <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
            </Link>
          </p>
        }
      />

      {/* What PickASparky isn't */}
      <Section
        tone="peach"
        aria-labelledby="independent-heading"
        className="my-14 md:my-20"
      >
        <Container>
          <Eyebrow className="mb-4">What PickASparky isn’t</Eyebrow>
          <h2
            id="independent-heading"
            className="text-[26px] font-extrabold leading-[1.3] tracking-[-0.02em] sm:text-[32px]"
          >
            We’re not an electrical contractor.
          </h2>
          <p className="mt-5 max-w-[900px] text-lg leading-relaxed sm:text-[22px] sm:leading-[1.5]">
            PickASparky is an independent marketplace. We don’t carry out
            electrical work ourselves and we don’t choose an electrician on your
            behalf. Our role is to make it easier to discover, compare and
            connect with electricians.
          </p>
          <ul className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6 lg:mt-12 lg:gap-0">
            {boundaries.map((item) => (
              <li key={item.title} className="lg:px-6">
                <IconBadge
                  icon={item.icon}
                  tone="coral"
                  size="lg"
                  className="bg-[#f0d0bf]"
                />
                <h3 className="mt-6 max-w-[340px] text-xl font-extrabold leading-[1.5] tracking-[-0.01em] lg:mt-8 lg:text-[22px] lg:leading-[1.75]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-[340px] text-sm leading-relaxed lg:mt-5">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <LocationsDirectory />

      <PageSchema
        {...page}
        type="AboutPage"
        crumb="About"
        extra={{
          about: { "@id": `${site.url}/#organization` },
          mainEntity: { "@id": `${site.url}/#organization` },
        }}
      />
    </>
  );
}
