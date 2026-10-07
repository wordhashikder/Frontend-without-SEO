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
import { CtaBand } from "@/components/sections/cta-band";
import { type FaqItem, FaqList } from "@/components/sections/faq";
import { FeatureCard, IconColumns } from "@/components/sections/feature-blocks";
import { JsonLd } from "@/components/sections/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

const description =
  "What NICEIC, NAPIT, TrustMark and MCS mean, what each electrician accreditation covers and how to check an electrician’s registration before you hire.";

const page = {
  title: "Electrician Accreditations: NICEIC, NAPIT, MCS",
  description,
  path: routes.accreditations,
};

export const metadata: Metadata = pageMetadata(page);

const schemes = [
  {
    icon: HardHat,
    iconTone: "mint",
    title: "NICEIC",
    text: "NICEIC operates a range of schemes for electrical businesses. Its Approved Contractor scheme assesses businesses against requirements including BS 7671 (the IET Wiring Regulations).",
  },
  {
    icon: FileText,
    iconTone: "mint",
    title: "NAPIT",
    text: "NAPIT operates schemes covering electrical work, including Competent Person Scheme membership and electrotechnical assessment routes for businesses and individual electricians.",
  },
  {
    icon: House,
    iconTone: "peach",
    title: "TrustMark",
    text: "TrustMark is the UK Government-endorsed quality scheme for work in and around the home. Registered businesses must meet scheme requirements around competence, customer service and trading practices.",
  },
  {
    icon: Leaf,
    iconTone: "mint",
    title: "MCS",
    text: "MCS certification relates to small-scale renewable and low-carbon technologies such as solar PV, heat pumps and electrical energy storage. This is relevant only for work involving these types of systems.",
  },
] as const;

const takeaways = [
  {
    icon: Target,
    iconTone: "mint",
    title: "Scope matters",
    text: "Check what specific work the business is registered or certified for, as each scheme covers different areas.",
  },
  {
    icon: Search,
    iconTone: "mint",
    title: "Check current status",
    text: "You can usually check an electrician’s or business’s registration status on the relevant scheme’s website.",
  },
  {
    icon: TriangleAlert,
    iconTone: "coral",
    title: "Not every scheme applies",
    text: "The right accreditation depends on the type of work being carried out – for example, MCS is only relevant for renewable energy systems.",
  },
] as const;

const considerations = [
  {
    icon: Settings,
    title: "Relevant experience",
    text: "Make sure they have experience with the type of work you need.",
  },
  {
    icon: FileText,
    title: "Clear quotations",
    text: "Get a detailed, written quote so you know what’s included.",
  },
  {
    icon: Shield,
    tone: "coral" as const,
    title: "Appropriate insurance",
    text: "Check they have suitable public liability insurance and, where relevant, employer’s liability insurance.",
  },
  {
    icon: Star,
    title: "Reviews and business information",
    text: "Look at customer reviews and check basic business details.",
  },
  {
    icon: UsersRound,
    title: "Right fit for your job",
    text: "Choose an electrician who is a good match for your specific needs.",
  },
];

/*
 * Regulatory answers are deliberately conservative: no dates, fees or
 * penalties, and readers are pointed to each scheme's own register.
 */
const faqs: FaqItem[] = [
  {
    question: "Does every electrician need to be NICEIC registered?",
    answer:
      "No. NICEIC is one of several bodies that assess and register electrical businesses, and registration with it is voluntary. NAPIT is another widely used scheme. What matters is that the electrician is qualified and registered for the type of work you need. In England and Wales, members of a Competent Person Scheme can self-certify that notifiable work in homes complies with the Building Regulations.",
  },
  {
    question: "What is a Competent Person Scheme?",
    answer:
      "A Competent Person Scheme is a government-authorised scheme whose registered members can self-certify that their work complies with the Building Regulations, instead of having it checked by local authority building control. For electrical work in homes in England and Wales this relates to Part P. Scheme operators include NICEIC and NAPIT. Scotland and Northern Ireland have their own building standards.",
  },
  {
    question: "What does MCS certification cover?",
    answer:
      "MCS certification covers small-scale renewable and low-carbon technologies, such as solar PV, heat pumps and battery storage. It is relevant only if your job involves one of these systems. It is not a general electrical accreditation, so an electrician does not need it for work such as rewiring or replacing a consumer unit.",
  },
  {
    question: "What is TrustMark?",
    answer:
      "TrustMark is the UK Government-endorsed quality scheme for work carried out in and around the home. Businesses registered with TrustMark must meet scheme requirements covering competence, customer service and trading practices. It covers many trades, not only electricians, so check what a business is registered for.",
  },
  {
    question: "How can I check an electrician’s registration?",
    answer:
      "Check the scheme’s own register. NICEIC, NAPIT, TrustMark and MCS each have a search on their website where you can look up a registered business. Ask the electrician for their registered business name or registration number, and make sure the registration covers the type of work you need. Registrations can change, so the scheme’s register is the place to confirm an electrician’s current status.",
  },
];

/** Section intro at the larger size this page's design uses. */
function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-base leading-relaxed sm:text-xl sm:leading-[1.6]">
      {children}
    </p>
  );
}

export default function AccreditationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Electrician accreditations"
        title="Understanding electrician accreditations"
        lead="Registrations and certification schemes can help you understand what an electrician or electrical business has been assessed or certified for. Different schemes cover different types of work, so the most relevant accreditation depends on the job you need done."
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
            eyebrow="Common accreditations and schemes"
            title="The main electrician accreditations in the UK"
            size="lg"
          />
          <Lead>
            Here are some of the most common schemes you may come across when
            looking for an electrician. Each one assesses different areas of
            work and may be relevant depending on your project.
          </Lead>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-6">
            {schemes.map((scheme) => (
              <li key={scheme.title}>
                <FeatureCard {...scheme} />
              </li>
            ))}
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
            eyebrow="What this means for you"
            title="What do these credentials actually tell you?"
            size="lg"
          />
          <Lead>
            Accreditations can be a useful indicator, but it’s important to
            understand what they cover and how to use them when choosing an
            electrician.
          </Lead>
          <ul className="mt-8 grid gap-4 md:mt-10 lg:grid-cols-3 lg:gap-6">
            {takeaways.map((item) => (
              <li key={item.title}>
                <FeatureCard {...item} tone="white" inline />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Beyond accreditation */}
      <Section aria-labelledby="consider-heading" className="md:pb-10">
        <Container>
          <SectionHeading
            id="consider-heading"
            eyebrow="Accreditation isn’t the whole picture"
            title="Other things to consider"
            size="lg"
          />
          <Lead>
            While accreditations are important, there are also other factors to
            look at when choosing an electrician. These can help you feel
            confident you’re working with the right person for your project.
          </Lead>
          <IconColumns items={considerations} className="mt-10" />
        </Container>
      </Section>

      {/* FAQ */}
      <Section spacing="sm" aria-labelledby="faq-heading" className="md:pb-20">
        <Container>
          <SectionHeading
            id="faq-heading"
            eyebrow="Frequently asked questions"
            title="Electrician accreditations FAQ"
            size="lg"
          />
          <FaqList items={faqs} withSchema className="mt-8 gap-4" />
        </Container>
      </Section>

      {/* The design sets this page's call to action on white, not the mint band. */}
      <div className="[&>section]:bg-white [&>section]:pt-0 md:[&>section]:pb-20">
        <CtaBand
          eyebrow="Ready to find an electrician?"
          title="Get quotes from trusted electricians"
          lead="Compare up to 5 quotes from vetted electricians in your area. It’s free, with no obligation."
        />
      </div>

      <LocationsDirectory />

      <PageSchema {...page} crumb="Electrician Accreditations" />
      <JsonLd
        data={guideArticleSchema({
          headline: "Understanding electrician accreditations",
          description,
          path: routes.accreditations,
          image: "/images/illustrations/accreditations.png",
          about: ["NICEIC", "NAPIT", "TrustMark", "MCS certification"],
        })}
      />
    </>
  );
}
