import {
  ArrowRight,
  Award,
  FileText,
  IdCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { type FaqItem, FaqList } from "@/components/sections/faq";
import { Callout, StepNumber } from "@/components/sections/feature-blocks";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { CheckBullet, IconBadge } from "@/components/ui/icon-badge";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const page = {
  title: "How We Vet Installers and Electricians",
  description:
    "How PickASparky vets electricians before they are listed: Companies House business checks, accreditations such as NICEIC and NAPIT, services and coverage.",
  path: routes.vetting,
};

export const metadata: Metadata = pageMetadata(page);

const steps = [
  {
    icon: FileText,
    title: "Business verification",
    text: "We verify the electrician’s business details using Companies House to check they are a legitimate and active company.",
  },
  {
    icon: Award,
    title: "Qualifications and accreditations",
    text: "We check industry accreditations such as NICEIC, NAPIT, MCS and OZEV (where applicable) to confirm they are properly qualified.",
  },
  {
    icon: IdCard,
    title: "Services and experience",
    text: "We review the services they offer, their experience and areas they cover to make sure they are a good match for homeowner needs.",
  },
  {
    icon: MapPin,
    title: "Coverage verification",
    text: "We confirm the areas they operate in, so you’re only matched with electricians who genuinely work in your location.",
  },
  {
    icon: ShieldCheck,
    title: "Ongoing monitoring",
    text: "We regularly review our listings to make sure information stays up to date and our standards are always met.",
  },
];

const outcomes = [
  {
    title: "Qualified and accredited",
    text: "Properly trained and certified for electrical work.",
  },
  {
    title: "Legitimate businesses",
    text: "Verified through official records.",
  },
  {
    title: "Experienced and local",
    text: "Providing the right services in your area.",
  },
  {
    title: "More confidence",
    text: "Get quotes from trusted electricians with peace of mind.",
  },
];

/*
 * Answers describe only the checks PickASparky actually runs (see the steps
 * above). Where something is not verified, the answer says so plainly.
 */
const faqs: FaqItem[] = [
  {
    question: "What qualifications do you check?",
    answer:
      "We check the industry accreditations and registrations an electrician holds, such as NICEIC, NAPIT, MCS and OZEV where they apply to the work on offer. We ask for these details when an electrician joins and we may request evidence before a profile is listed. Registrations can change, so you can also confirm an electrician’s current status on the scheme’s own register.",
  },
  {
    question: "Do you only list NICEIC or NAPIT electricians?",
    answer:
      "No. NICEIC and NAPIT are two of the most widely used schemes, but they are not the only ones we look at. We also consider other relevant registrations, such as MCS and OZEV where applicable. Each profile shows the accreditations that business holds, so you can see which ones matter for your job.",
  },
  {
    question: "Do you check that electricians are insured?",
    answer:
      "Insurance is not one of our verification checks. We ask electricians to confirm that they hold appropriate insurance for the work they carry out and we may request evidence, but we do not verify or monitor individual policies. Before you hire, ask the electrician to show you their public liability cover and, where relevant, employer’s liability cover.",
  },
  {
    question: "How do you verify business details?",
    answer:
      "We check the business details an electrician gives us against the official Companies House record, to confirm that the company exists and is active. We also review the services they offer and the areas they cover before the profile is listed.",
  },
  {
    question: "Do you carry out background checks?",
    answer:
      "Our vetting does not include criminal record (DBS) or other personal background checks on individual electricians. It focuses on the business: its Companies House record, its accreditations, the services it offers and the areas it covers. If a background check matters for your job, ask the electrician about it directly before work starts.",
  },
  {
    question: "How often do you review listings?",
    answer:
      "We review listings regularly as part of our ongoing monitoring, to check that the information shown is still up to date and that our standards are still being met. We also look again at a listing when a problem with it is reported to us.",
  },
  {
    question: "Can I report an issue with a listing?",
    answer: `Yes. Email ${site.email} with the name of the electrician and a short description of the issue. Our support team is available Monday to Friday, 9:00am to 5:00pm UK time, and replies within 1 working day. We will review the listing and may update or remove it.`,
  },
];

export default function VettingPage() {
  return (
    <>
      <PageHero
        eyebrow="How we vet installers"
        title="Trusted electricians for your peace of mind"
        lead="We know that letting someone work in your home or business is a big decision. That’s why we carefully vet all electricians before they are listed on PickASparky to make sure they are qualified, legitimate and trustworthy."
        aside={
          <Callout
            title="Our commitment"
            className="lg:min-h-[296px] lg:self-start"
          >
            <p className="sm:text-xl sm:leading-[1.5]">
              We only list genuine, qualified and reputable electricians who
              meet our standards. This helps you get quotes with confidence.
            </p>
          </Callout>
        }
      />

      {/* Vetting process */}
      <Section
        spacing="sm"
        aria-labelledby="process-heading"
        className="md:pt-5 md:pb-20"
      >
        <Container>
          <SectionHeading
            id="process-heading"
            title="Our vetting process"
            lead="Every electrician is checked using a combination of official records, qualifications and business details before they can be listed on our platform."
          />
          <ol className="mt-8 divide-y divide-line lg:mt-10 lg:grid lg:grid-cols-5 lg:divide-x lg:divide-y-0">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="py-6 first:pt-0 last:pb-0 sm:flex sm:gap-6 lg:block lg:pt-4 lg:pr-10 lg:pb-6 lg:pl-4 lg:first:pt-4 lg:last:pr-4 lg:last:pb-6"
              >
                <div className="flex shrink-0 items-center gap-4">
                  <StepNumber>{index + 1}</StepNumber>
                  <IconBadge
                    icon={step.icon}
                    size="lg"
                    className={cn(index % 2 === 1 && "bg-mint-soft")}
                  />
                </div>
                <div className="mt-4 sm:mt-0 lg:mt-7 lg:text-center">
                  <h3 className="relative text-base font-extrabold leading-normal tracking-[-0.01em]">
                    {step.title}
                    {index < steps.length - 1 ? (
                      <ArrowRight
                        aria-hidden
                        className="absolute top-0 -right-8 hidden size-6 text-ink lg:block"
                        strokeWidth={1.75}
                      />
                    ) : null}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed lg:mt-4 lg:leading-5">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Outcomes */}
      <Section tone="mint" aria-labelledby="outcomes-heading">
        <Container>
          <SectionHeading
            id="outcomes-heading"
            title="What this means for you"
            lead="Our vetting process helps ensure you’re connected with electricians who are:"
          />
          <ul className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((item) => (
              <li key={item.title} className="flex gap-4">
                <CheckBullet className="size-10" />
                <div>
                  <h3 className="text-lg font-extrabold leading-[1.5] tracking-[-0.01em] sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-base leading-normal">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* FAQ */}
      <Section aria-labelledby="faq-heading">
        <Container>
          <SectionHeading
            id="faq-heading"
            title="Frequently asked questions"
            lead="Find answers to common questions about how we vet electricians on PickASparky."
          />
          <FaqList items={faqs} withSchema className="mt-6 gap-4" />
        </Container>
      </Section>

      <LocationsDirectory />

      <PageSchema {...page} crumb="How We Vet Installers" />
    </>
  );
}
