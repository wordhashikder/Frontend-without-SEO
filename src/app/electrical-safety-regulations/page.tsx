import {
  ClipboardCheck,
  FileText,
  House,
  Plug,
  Shield,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import { guideArticleSchema } from "@/components/about/guide-schema";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { ClosingSection } from "@/components/sections/closing-section";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqList } from "@/components/sections/faq";
import {
  Callout,
  FeatureCard,
  IconColumns,
} from "@/components/sections/feature-blocks";
import { JsonLd } from "@/components/sections/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { keyed } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("safety");
  return pageMetadata({ ...seo, path: routes.safety });
}

/* Icons and colours pair with the editable cards by position. */
const regulationStyles = [
  { icon: FileText, iconTone: "mint" },
  { icon: FileText, iconTone: "mint" },
  { icon: Shield, iconTone: "coral" },
  { icon: ClipboardCheck, iconTone: "mint" },
] as const;

const jobStyles = [
  { icon: House, tone: "peach" as const },
  { icon: Wrench },
  { icon: Plug },
  { icon: FileText, tone: "sand" as const },
  { icon: TriangleAlert, tone: "coral" as const },
];

export default async function ElectricalSafetyPage() {
  const { seo, hero, why, regulations, when, faq, cta } =
    await getContent("safety");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.lead}
        image={{
          src: "/images/illustrations/electrical-safety.png",
          width: 380,
          height: 359,
          className: "lg:max-w-[365px]",
        }}
        className="lg:pt-36 lg:pb-24"
      />

      {/* Why it matters */}
      <Section spacing="sm" aria-labelledby="why-heading">
        <Container className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
          <div>
            <h2
              id="why-heading"
              className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[32px] md:text-4xl"
            >
              {why.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed sm:text-base sm:leading-8">
              {why.text}
            </p>
          </div>
          <Callout title={why.callout_title}>
            <p>{why.callout_text}</p>
          </Callout>
        </Container>
      </Section>

      {/* Key regulations */}
      <Section spacing="sm" aria-labelledby="regulations-heading">
        <Container>
          <SectionHeading id="regulations-heading" title={regulations.title} />
          <p className="mt-4 text-[15px] leading-relaxed">{regulations.lead}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {keyed(regulations.cards, (card) => card.title).map(
              ({ item, key }, index) => (
                <li key={key}>
                  <FeatureCard
                    {...regulationStyles[index % regulationStyles.length]}
                    title={item.title}
                    text={item.text}
                  />
                </li>
              ),
            )}
          </ul>
        </Container>
      </Section>

      {/* When to use an electrician */}
      <Section spacing="sm" aria-labelledby="when-heading">
        <Container>
          <SectionHeading
            id="when-heading"
            title={when.title}
            lead={when.lead}
          />
          <IconColumns
            items={when.items.map((item, index) => ({
              ...jobStyles[index % jobStyles.length],
              title: item.title,
              text: item.text,
            }))}
            className="mt-8 lg:mt-10"
          />
        </Container>
      </Section>

      {/* FAQ */}
      <Section spacing="sm" aria-labelledby="faq-heading" className="md:pb-20">
        <Container>
          <SectionHeading id="faq-heading" title={faq.title} lead={faq.lead} />
          <FaqList items={faq.items} withSchema className="mt-6 gap-4" />
        </Container>
      </Section>

      <CtaBand
        eyebrow={cta.eyebrow}
        title={cta.title}
        lead={cta.lead}
        buttonLabel={cta.button}
      />

      <ClosingSection page="safety" />

      <LocationsDirectory />

      <PageSchema
        title={seo.title}
        description={seo.description}
        path={routes.safety}
        crumb="Electrical Safety & Regulations"
      />
      <JsonLd
        data={guideArticleSchema({
          headline: hero.title,
          description: seo.description,
          path: routes.safety,
          image: "/images/illustrations/electrical-safety.png",
          about: [
            "Part P of the Building Regulations",
            "BS 7671 (IET Wiring Regulations)",
            "Competent Person Schemes",
            "Electrical Installation Condition Report (EICR)",
          ],
        })}
      />
    </>
  );
}
