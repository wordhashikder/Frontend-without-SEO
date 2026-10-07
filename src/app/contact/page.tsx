import {
  Clock,
  Mail,
  MessageSquareMore,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { PageSchema } from "@/components/sections/page-schema";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Eyebrow } from "@/components/ui/layout";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";

const description = `Contact PickASparky about quotes, joining as an electrician or your account. Email ${site.email}. We aim to reply within 1 working day.`;

const page = {
  title: "Contact Us: Homeowner and Electrician Support",
  description,
  path: routes.contact,
};

export const metadata: Metadata = pageMetadata(page);

const promises = [
  {
    icon: MessageSquareMore,
    title: "Quick response",
    text: "We aim to reply to all enquiries within 1 working day.",
  },
  {
    icon: ShieldCheck,
    title: "Friendly support",
    text: "Our team is here to help homeowners and electricians.",
  },
  {
    icon: UsersRound,
    title: "For homeowners and electricians",
    text: "Get the information you need about quotes, listings and memberships.",
  },
];

/** Who this page is about: the organisation and how to reach its support team. */
const supportContact = {
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  url: absoluteUrl(routes.home),
  email: site.email,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: site.email,
    areaServed: "GB",
    availableLanguage: "English",
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="pt-12 pb-12 md:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-7">
          <div>
            <Eyebrow className="mb-2">Contact us</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[1.25] tracking-[-0.01em] sm:text-[40px] md:text-5xl md:leading-[1.45]">
              We&apos;re here <br className="hidden lg:block" />
              to help
            </h1>
            <p className="mt-3 max-w-[600px] text-base leading-relaxed sm:text-xl sm:leading-[1.6] md:text-[22px] md:leading-8">
              Have a question about getting quotes, joining as an electrician or
              anything else? Get in touch and we&apos;ll be happy to help.
            </p>

            <div className="mt-9 space-y-8 md:mt-10 md:space-y-10">
              <div className="flex items-center gap-4">
                <IconBadge
                  icon={Mail}
                  size="lg"
                  className="bg-[#ebf7f1] text-ink"
                />
                <div>
                  <h2 className="text-sm font-semibold leading-5">Email us</h2>
                  <p className="mt-1.5 max-w-[290px] text-xs leading-4">
                    For general enquiries, support or partnership opportunities.
                  </p>
                  <a
                    href={`mailto:${site.email}`}
                    className="-my-2.5 inline-block py-3 text-xs text-primary underline underline-offset-2 hover:text-primary-dark"
                  >
                    {site.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <IconBadge icon={Clock} tone="peach" size="lg" />
                <div>
                  <h2 className="text-sm font-semibold leading-5">Our hours</h2>
                  <p className="mt-1.5 text-xs leading-6">
                    {site.hours.days}
                    <br />
                    {site.hours.time}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <ContactForm />
          </div>
        </Container>
      </section>

      <section aria-labelledby="promises-heading" className="pb-14 md:pb-20">
        <Container>
          <div className="bg-mint-soft px-5 py-10 sm:px-4 lg:py-20">
            <h2 id="promises-heading" className="sr-only">
              What to expect when you contact us
            </h2>
            <ul className="grid gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-[#cad1cf]">
              {promises.map((promise) => (
                <li
                  key={promise.title}
                  className="flex items-center gap-4 sm:px-6 lg:min-h-32"
                >
                  <IconBadge
                    icon={promise.icon}
                    tone="green"
                    size="lg"
                    className="text-ink"
                  />
                  <div>
                    <h3 className="text-lg font-extrabold leading-8 sm:text-xl sm:leading-10">
                      {promise.title}
                    </h3>
                    <p className="max-w-[270px] text-sm leading-5">
                      {promise.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <LocationsDirectory />

      <PageSchema
        {...page}
        type="ContactPage"
        crumb="Contact Us"
        extra={{ mainEntity: supportContact }}
      />
    </>
  );
}