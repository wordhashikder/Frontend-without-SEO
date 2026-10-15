import { FileText, Mail, MapPin, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import {
  FlowActions,
  type FlowStep,
  StepFlow,
} from "@/components/how-it-works/step-flow";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { ClosingSection } from "@/components/sections/closing-section";
import { JsonLd } from "@/components/sections/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { getContent } from "@/lib/content";
import { howToSchema, pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("how-it-works");
  return pageMetadata({ ...seo, path: routes.howItWorks });
}

/* Each step's icon and colour pair with the editable steps by position. */
const homeownerStyles = [
  { icon: MapPin, chipClassName: "bg-mint-soft" },
  { icon: Mail, chipClassName: "bg-mint" },
  { icon: FileText, chipClassName: "bg-stone" },
];
const installerStyles = [
  { icon: UserPlus, chipClassName: "bg-mint-soft" },
  { icon: FileText, chipClassName: "bg-white" },
  { icon: Mail, chipClassName: "bg-mint" },
];

function flowSteps(
  items: readonly { title: string; text: string }[],
  styles: { icon: FlowStep["icon"]; chipClassName: string }[],
): FlowStep[] {
  return items.map((item, index) => ({
    ...styles[index % styles.length],
    title: item.title,
    text: item.text,
  }));
}

export default async function HowItWorksPage() {
  const { seo, hero, homeowners, electricians } =
    await getContent("how-it-works");
  const homeownerSteps = flowSteps(homeowners.steps, homeownerStyles);
  const installerSteps = flowSteps(electricians.steps, installerStyles);
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        image={{
          src: "/images/illustrations/how-it-works.png",
          width: 473,
          height: 286,
          // From xl the artwork sits at its natural size, pulled towards the copy as in the design.
          className:
            "xl:-mt-1 xl:-ml-[123px] xl:w-[473px] xl:max-w-none xl:self-start",
        }}
        className="md:pb-20"
      >
        <p className="mt-3 max-w-[590px] text-base leading-relaxed sm:text-xl sm:leading-[1.6] md:text-[22px] md:leading-8">
          {hero.lead}
        </p>
      </PageHero>

      <Section
        id="for-homeowners"
        tone="mint"
        aria-labelledby="homeowners-heading"
      >
        <Container>
          <SectionHeading
            id="homeowners-heading"
            eyebrow={homeowners.eyebrow}
            title={homeowners.title}
            lead={homeowners.lead}
          />
          <StepFlow steps={homeownerSteps} className="mt-10" />
          <FlowActions claims={homeowners.claims.map((claim) => claim.text)}>
            <ButtonLink href={routes.quotes} size="lg" arrow>
              {homeowners.button}
            </ButtonLink>
          </FlowActions>
        </Container>
      </Section>

      <Section id="for-electricians" aria-labelledby="electricians-heading">
        <Container>
          <SectionHeading
            id="electricians-heading"
            eyebrow={electricians.eyebrow}
            title={electricians.title}
            lead={electricians.lead}
          />
          <StepFlow steps={installerSteps} tone="stone" className="mt-10" />
          <FlowActions claims={electricians.claims.map((claim) => claim.text)}>
            <ButtonLink href={routes.join} variant="dark" size="lg" arrow>
              {electricians.button}
            </ButtonLink>
          </FlowActions>
        </Container>
      </Section>

      <ClosingSection page="how-it-works" />

      <LocationsDirectory />

      <PageSchema
        title={seo.title}
        description={seo.description}
        path={routes.howItWorks}
        crumb="How It Works"
      />
      <JsonLd
        data={howToSchema({
          name: "How to compare electrician quotes with PickASparky",
          description:
            "Three steps for homeowners to request and compare free, no-obligation quotes from local electricians through PickASparky.",
          steps: homeownerSteps.map((step) => ({
            name: step.title,
            text: step.text,
          })),
        })}
      />
    </>
  );
}
