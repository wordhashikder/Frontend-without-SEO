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
import { ClosingSection } from "@/components/sections/closing-section";
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
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import { keyed } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("about");
  return pageMetadata({ ...seo, path: routes.about });
}

/* Icons pair with the editable cards by position. */
const differenceIcons = [
  { icon: FileText, iconTone: "coral" },
  { icon: MapPin, iconTone: "green" },
  { icon: ShieldCheck, iconTone: "green" },
  { icon: Users, iconTone: "coral" },
] as const;

const schemeLogos = [
  { name: "NICEIC", src: "niceic.png", width: 134, height: 56 },
  { name: "NAPIT", src: "napit.png", width: 91, height: 117 },
  { name: "TrustMark", src: "trustmark.png", width: 145, height: 87 },
  { name: "MCS Certified", src: "mcs.png", width: 90, height: 100 },
];

const boundaryIcons = [Wrench, UsersRound, Search];

export default async function AboutPage() {
  const content = await getContent("about");
  const { hero, why, different, electricians, trust, cta, isnt } = content;
  return (
    <>
      <PhotoBanner
        id="about-heading"
        as="h1"
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.lead}
        image={{
          src: hero.image || "/images/about/hero-electrician.jpg",
          alt: hero.image_alt,
        }}
        preload
        className="mt-6 lg:mt-10"
      />

      {/* Why we built PickASparky */}
      <Section aria-labelledby="why-heading">
        <Container className="grid items-start gap-8 sm:grid-cols-[minmax(0,294px)_minmax(0,1fr)] sm:gap-10">
          <Image
            src={why.image || "/images/about/homeowner-searching.jpg"}
            alt={why.image_alt}
            width={294}
            height={248}
            sizes="(min-width: 640px) 294px, 100vw"
            className="h-auto w-full rounded-2xl"
          />
          <div>
            <Eyebrow className="mb-2">{why.eyebrow}</Eyebrow>
            <h2
              id="why-heading"
              className="text-[26px] font-extrabold leading-[1.3] tracking-[-0.02em] sm:text-[32px]"
            >
              {why.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed sm:mt-6 lg:text-2xl lg:leading-[1.5]">
              {why.text}
            </p>
          </div>
        </Container>
      </Section>

      {/* What we do differently */}
      <Section aria-labelledby="different-heading">
        <Container>
          <SectionHeading
            id="different-heading"
            eyebrow={different.eyebrow}
            title={different.title}
            size="lg"
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-6">
            {keyed(different.cards, (card) => card.title).map(
              ({ item, key }, index) => {
                const style = differenceIcons[index % differenceIcons.length];
                return (
                  <li key={key}>
                    <FeatureCard
                      icon={style.icon}
                      iconTone={style.iconTone}
                      title={item.title}
                      text={item.text}
                      tone="sand"
                      className="bg-stone lg:min-h-[288px]"
                    />
                  </li>
                );
              },
            )}
          </ul>
        </Container>
      </Section>

      <PhotoBanner
        id="electricians-heading"
        eyebrow={electricians.eyebrow}
        title={electricians.title}
        lead={electricians.lead}
        image={{
          src:
            electricians.image || "/images/about/independent-electrician.jpg",
          alt: electricians.image_alt,
        }}
        contentClassName="lg:min-h-[552px] lg:py-20"
      >
        <ButtonLink href={routes.join} size="lg" arrow>
          {electricians.button}
        </ButtonLink>
      </PhotoBanner>

      {/* Trust and transparency */}
      <Section aria-labelledby="trust-heading">
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <Eyebrow className="mb-4">{trust.eyebrow}</Eyebrow>
            <h2
              id="trust-heading"
              className="text-[26px] font-extrabold leading-[1.3] tracking-[-0.02em] sm:text-[32px] sm:leading-[1.5]"
            >
              {trust.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed sm:text-[22px] sm:leading-[1.5]">
              {trust.text}
            </p>
            <Link
              href={routes.accreditations}
              className="mt-7 inline-flex min-h-10 items-center gap-2.5 text-sm font-semibold text-primary hover:text-primary-dark"
            >
              {trust.link}
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
        eyebrow={cta.eyebrow}
        title={cta.title}
        buttonLabel={cta.button}
        footnote={
          <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-semibold text-ink">
            {cta.footnote}
            <Link
              href={routes.join}
              className="inline-flex min-h-10 items-center gap-2 text-primary hover:text-primary-dark"
            >
              {cta.footnote_link}
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
          <Eyebrow className="mb-4">{isnt.eyebrow}</Eyebrow>
          <h2
            id="independent-heading"
            className="text-[26px] font-extrabold leading-[1.3] tracking-[-0.02em] sm:text-[32px]"
          >
            {isnt.title}
          </h2>
          <p className="mt-5 max-w-[900px] text-lg leading-relaxed sm:text-[22px] sm:leading-[1.5]">
            {isnt.text}
          </p>
          <ul className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6 lg:mt-12 lg:gap-0">
            {keyed(isnt.items, (item) => item.title).map(
              ({ item, key }, index) => (
                <li key={key} className="lg:px-6">
                  <IconBadge
                    icon={boundaryIcons[index % boundaryIcons.length]}
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
              ),
            )}
          </ul>
        </Container>
      </Section>

      <ClosingSection page="about" />

      <LocationsDirectory />

      <PageSchema
        title={content.seo.title}
        description={content.seo.description}
        path={routes.about}
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
