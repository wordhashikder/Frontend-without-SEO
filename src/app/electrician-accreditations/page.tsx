import {
  FileText,
  HardHat,
  House,
  Leaf,
  Search,
  Settings,
  Shield,
  Star,
  Target,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { guideArticleSchema } from "@/components/about/guide-schema";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { ClosingSection } from "@/components/sections/closing-section";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqList } from "@/components/sections/faq";
import { FeatureCard, IconColumns } from "@/components/sections/feature-blocks";
import { JsonLd } from "@/components/sections/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { keyed } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("accreditations");
  return pageMetadata({ ...seo, path: routes.accreditations });
}

/* Icons and colours pair with the editable cards by position. */
const schemeStyles = [
  { icon: HardHat, iconTone: "mint" },
  { icon: FileText, iconTone: "mint" },
  { icon: House, iconTone: "peach" },
  { icon: Leaf, iconTone: "mint" },
] as const;

const takeawayStyles = [
  { icon: Target, iconTone: "mint" },
  { icon: Search, iconTone: "mint" },
  { icon: TriangleAlert, iconTone: "coral" },
] as const;

const considerationStyles = [
  { icon: Settings },
  { icon: FileText },
  { icon: Shield, tone: "coral" as const },
  { icon: Star },
  { icon: UsersRound },
];

/** Section intro at the larger size this page's design uses. */
function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-base leading-relaxed sm:text-xl sm:leading-[1.6]">
      {children}
    </p>
  );
}

export default async function AccreditationsPage() {
  const { seo, hero, schemes, meaning, consider, faq, cta } =
    await getContent("accreditations");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.lead}
        image={{
          src: "/images/illustrations/accreditations.png",
          width: 323,
          height: 258,
          className: "lg:mr-0 lg:max-w-[305px]",
        }}
        className="lg:pt-24"
      />

      {/* The main schemes */}
      <Section aria-labelledby="schemes-heading" className="md:pt-12">
        <Container>
          <SectionHeading
            id="schemes-heading"
            eyebrow={schemes.eyebrow}
            title={schemes.title}
            size="lg"
          />
          <Lead>{schemes.lead}</Lead>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-6">
            {keyed(schemes.cards, (card) => card.title).map(
              ({ item, key }, index) => (
                <li key={key}>
                  <FeatureCard
                    {...schemeStyles[index % schemeStyles.length]}
                    title={item.title}
                    text={item.text}
                  />
                </li>
              ),
            )}
          </ul>
        </Container>
      </Section>

      {/* What accreditations tell you */}
      <Section
        tone="peach"
        aria-labelledby="meaning-heading"
        className="bg-peach"
      >
        <Container>
          <SectionHeading
            id="meaning-heading"
            eyebrow={meaning.eyebrow}
            title={meaning.title}
            size="lg"
          />
          <Lead>{meaning.lead}</Lead>
          <ul className="mt-8 grid gap-4 md:mt-10 lg:grid-cols-3 lg:gap-6">
            {keyed(meaning.cards, (card) => card.title).map(
              ({ item, key }, index) => (
                <li key={key}>
                  <FeatureCard
                    {...takeawayStyles[index % takeawayStyles.length]}
                    title={item.title}
                    text={item.text}
                    tone="white"
                    inline
                  />
                </li>
              ),
            )}
          </ul>
        </Container>
      </Section>

      {/* Beyond accreditation */}
      <Section aria-labelledby="consider-heading" className="md:pb-10">
        <Container>
          <SectionHeading
            id="consider-heading"
            eyebrow={consider.eyebrow}
            title={consider.title}
            size="lg"
          />
          <Lead>{consider.lead}</Lead>
          <IconColumns
            items={consider.items.map((item, index) => ({
              ...considerationStyles[index % considerationStyles.length],
              title: item.title,
              text: item.text,
            }))}
            className="mt-10"
          />
        </Container>
      </Section>

      {/* FAQ */}
      <Section spacing="sm" aria-labelledby="faq-heading" className="md:pb-20">
        <Container>
          <SectionHeading
            id="faq-heading"
            eyebrow={faq.eyebrow}
            title={faq.title}
            size="lg"
          />
          <FaqList items={faq.items} withSchema className="mt-8 gap-4" />
        </Container>
      </Section>

      {/* The design sets this page's call to action on white, not the mint band. */}
      <div className="[&>section]:bg-white [&>section]:pt-0 md:[&>section]:pb-20">
        <CtaBand
          eyebrow={cta.eyebrow}
          title={cta.title}
          lead={cta.lead}
          buttonLabel={cta.button}
        />
      </div>

      <ClosingSection page="accreditations" />

      <LocationsDirectory />

      <PageSchema
        title={seo.title}
        description={seo.description}
        path={routes.accreditations}
        crumb="Electrician Accreditations"
      />
      <JsonLd
        data={guideArticleSchema({
          headline: hero.title,
          description: seo.description,
          path: routes.accreditations,
          image: "/images/illustrations/accreditations.png",
          about: ["NICEIC", "NAPIT", "TrustMark", "MCS certification"],
        })}
      />
    </>
  );
}
