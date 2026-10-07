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
import { CtaBand } from "@/components/sections/cta-band";
import { type FaqItem, FaqList } from "@/components/sections/faq";
import {
  Callout,
  FeatureCard,
  IconColumns,
} from "@/components/sections/feature-blocks";
import { JsonLd } from "@/components/sections/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

const description =
  "A plain-English guide to UK electrical safety: Part P of the Building Regulations, BS 7671, Competent Person Schemes, EICRs and when to use an electrician.";

const page = {
  title: "Electrical Safety Regulations UK: Simple Guide",
  description,
  path: routes.safety,
};

export const metadata: Metadata = pageMetadata(page);

const regulations = [
  {
    icon: FileText,
    iconTone: "mint",
    title: "Building Regulations (Part P)",
    text: "Covers electrical safety in dwellings. Most electrical work in homes must comply with Part P of the Building Regulations.",
  },
  {
    icon: FileText,
    iconTone: "mint",
    title: "BS 7671 (IET Wiring Regulations)",
    text: "The national standard for electrical installations in the UK. It sets out the requirements for the design, installation and inspection of electrical systems.",
  },
  {
    icon: Shield,
    iconTone: "coral",
    title: "Competent Person Schemes",
    text: "Schemes such as NICEIC and NAPIT allow qualified electricians to self-certify that their work complies with Building Regulations.",
  },
  {
    icon: ClipboardCheck,
    iconTone: "mint",
    title: "Electrical Installation Condition Report (EICR)",
    text: "A thorough inspection and test of an existing electrical installation to assess its safety and condition. Commonly required for rented properties and recommended for older homes.",
  },
] as const;

const jobs = [
  {
    icon: House,
    tone: "peach" as const,
    title: "New installations",
    text: "e.g. new builds, extensions or additional circuits",
  },
  {
    icon: Wrench,
    title: "Major electrical work",
    text: "e.g. rewiring, consumer unit upgrades",
  },
  {
    icon: Plug,
    title: "Work in special locations",
    text: "e.g. bathrooms, kitchens or outdoor areas",
  },
  {
    icon: FileText,
    tone: "sand" as const,
    title: "Safety inspections",
    text: "e.g. EICR for landlords or older properties",
  },
  {
    icon: TriangleAlert,
    tone: "coral" as const,
    title: "Fault finding and repairs",
    text: "to keep your home or business safe",
  },
];

/*
 * Regulatory answers stay within well-established facts and are phrased
 * conservatively: no fine amounts, amendment dates or legal advice.
 */
const faqs: FaqItem[] = [
  {
    question: "What is Part P of the Building Regulations?",
    answer:
      "Part P is the part of the Building Regulations that covers electrical safety in dwellings in England and Wales. It requires electrical work in homes to be designed and installed so that people are protected from fire and injury. Some types of work are notifiable, which means they must be certified as compliant, for example by an electrician registered with a Competent Person Scheme. Scotland and Northern Ireland have their own building standards.",
  },
  {
    question: "Do I need a qualified electrician for small jobs?",
    answer:
      "We recommend using a qualified electrician for any work on fixed wiring, however small. Not every small job is notifiable under the Building Regulations, but electrical work in a home should still be carried out safely and to BS 7671, the IET Wiring Regulations. If you are not sure whether a job needs to be notified, ask a registered electrician or your local authority building control before work starts.",
  },
  {
    question: "What is an Electrical Installation Condition Report (EICR)?",
    answer:
      "An Electrical Installation Condition Report (EICR) is the report produced after a qualified person inspects and tests the existing electrical installation in a property. It records the condition of the installation and notes any damage, deterioration or defects that could be a safety risk and need attention.",
  },
  {
    question: "How often should an EICR be carried out?",
    answer:
      "It depends on the property. In the private rented sector in England, an EICR is required at least every 5 years. For owner-occupied homes, a periodic inspection is commonly recommended about every 10 years, or when the occupancy changes. Other parts of the UK have their own rules for rented homes, and the electrician carrying out the inspection may recommend a shorter interval for an older installation.",
  },
  {
    question:
      "What happens if electrical work doesn’t comply with regulations?",
    answer:
      "Non-compliant electrical work can be unsafe and may need to be put right. Where notifiable work does not comply with the Building Regulations, local authority building control can take enforcement action. Missing certificates can also cause problems when you come to sell the property.",
  },
  {
    question: "How can I check if an electrician is qualified?",
    answer:
      "Ask which scheme the electrician is registered with, then check that scheme’s own register. Schemes such as NICEIC and NAPIT have a search on their website where you can look up a business and confirm its current status. Make sure the registration covers the type of work you need, and ask for the relevant certificate when the work is finished.",
  },
];

export default function ElectricalSafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Electrical safety & regulations"
        title="A simple guide to UK electrical safety and regulations"
        lead="Understand the key rules, standards and legal requirements for electrical work in the UK. Whether you’re a homeowner or looking for an electrician, this guide explains what you need to know to stay safe and compliant."
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
              Why electrical safety matters
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed sm:text-base sm:leading-8">
              Electrical work that isn’t carried out correctly can be dangerous
              and may lead to electric shocks, fires or damage to property. UK
              regulations and standards are in place to ensure electrical
              installations are safe, reliable and carried out by competent
              people.
            </p>
          </div>
          <Callout title="Use a qualified electrician">
            <p>
              Always choose an electrician who is properly registered and
              qualified for the type of work you need.
            </p>
          </Callout>
        </Container>
      </Section>

      {/* Key regulations */}
      <Section spacing="sm" aria-labelledby="regulations-heading">
        <Container>
          <SectionHeading
            id="regulations-heading"
            title="Key regulations and standards"
          />
          <p className="mt-4 text-[15px] leading-relaxed">
            Electrical work in the UK is covered by a number of regulations and
            standards. Here are the most important ones to know about.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {regulations.map((item) => (
              <li key={item.title}>
                <FeatureCard {...item} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* When to use an electrician */}
      <Section spacing="sm" aria-labelledby="when-heading">
        <Container>
          <SectionHeading
            id="when-heading"
            title="When do you need an electrician?"
            lead="You should always use a qualified electrician for:"
          />
          <IconColumns items={jobs} className="mt-8 lg:mt-10" />
        </Container>
      </Section>

      {/* FAQ */}
      <Section spacing="sm" aria-labelledby="faq-heading" className="md:pb-20">
        <Container>
          <SectionHeading
            id="faq-heading"
            title="Frequently asked questions"
            lead="Get answers to common questions about electrical safety and regulations in the UK."
          />
          <FaqList items={faqs} withSchema className="mt-6 gap-4" />
        </Container>
      </Section>

      <CtaBand
        eyebrow="Need a qualified electrician?"
        title="Get quotes from trusted electricians"
        lead="Find vetted electricians in your area and get up to 5 quotes for your project."
      />

      <LocationsDirectory />

      <PageSchema {...page} crumb="Electrical Safety & Regulations" />
      <JsonLd
        data={guideArticleSchema({
          headline: "A simple guide to UK electrical safety and regulations",
          description,
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
