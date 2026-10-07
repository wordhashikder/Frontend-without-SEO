import { FileText, Mail, MapPin, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import {
  FlowActions,
  type FlowStep,
  StepFlow,
} from "@/components/how-it-works/step-flow";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { JsonLd } from "@/components/sections/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { howToSchema, pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

const page = {
  title: "How It Works for Homeowners and Electricians",
  description:
    "See how PickASparky works: homeowners enter a postcode and compare up to 5 free quotes from vetted electricians, and installers build a profile to win work.",
  path: routes.howItWorks,
};

export const metadata: Metadata = pageMetadata(page);

const homeownerSteps: FlowStep[] = [
  {
    icon: MapPin,
    title: "Tell us what you need",
    text: "Enter your postcode and answer a few questions about the work you need.",
    chipClassName: "bg-mint-soft",
  },
  {
    icon: Mail,
    title: "Receive quotes",
    text: "Your request is sent to suitable electricians in your area who can respond with their quotes.",
    chipClassName: "bg-mint",
  },
  {
    icon: FileText,
    title: "Choose your electrician",
    text: "Compare the quotes and information, and choose the electrician you want to work with.",
    chipClassName: "bg-stone",
  },
];

const installerSteps: FlowStep[] = [
  {
    icon: UserPlus,
    title: "Join as an installer",
    text: "Create an installer account and add your business details.",
    chipClassName: "bg-mint-soft",
  },
  {
    icon: FileText,
    title: "Build your profile",
    text: "Showcase your services, areas covered, accreditations and business information.",
    chipClassName: "bg-white",
  },
  {
    icon: Mail,
    title: "Receive enquiries",
    text: "Get enquiries from homeowners and businesses looking for the services you provide.",
    chipClassName: "bg-mint",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="A simple way to connect homeowners and electricians"
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
          PickASparky makes it easy to find and compare electricians in your
          area. Whether you need electrical work at home or want to join as an
          installer, here&apos;s how it works.
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
            eyebrow="For homeowners"
            title="How it works for homeowners"
            lead="Tell us what you need, receive quotes from suitable electricians and choose who you want to work with. It's free, with no obligation, and you stay in control."
          />
          <StepFlow steps={homeownerSteps} className="mt-10" />
          <FlowActions
            claims={["Free to use", "No obligation", "You stay in control"]}
          >
            <ButtonLink href={routes.quotes} size="lg" arrow>
              Get Free Quotes
            </ButtonLink>
          </FlowActions>
        </Container>
      </Section>

      <Section id="for-electricians" aria-labelledby="electricians-heading">
        <Container>
          <SectionHeading
            id="electricians-heading"
            eyebrow="For electricians"
            title="How it works for electricians"
            lead="Join PickASparky to connect with homeowners and businesses looking for electrical services in your area. Create your profile, showcase your services and start receiving relevant enquiries."
          />
          <StepFlow steps={installerSteps} tone="stone" className="mt-10" />
          <FlowActions
            claims={[
              "Reach new customers",
              "Showcase your services",
              "Grow your business",
            ]}
          >
            <ButtonLink href={routes.join} variant="dark" size="lg" arrow>
              Join as an Installer
            </ButtonLink>
          </FlowActions>
        </Container>
      </Section>

      <LocationsDirectory />

      <PageSchema {...page} crumb="How It Works" />
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
