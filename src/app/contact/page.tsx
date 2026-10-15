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
import { ClosingSection } from "@/components/sections/closing-section";
import { PageSchema } from "@/components/sections/page-schema";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Eyebrow } from "@/components/ui/layout";
import { getContent, getOrganisation, getSiteContent } from "@/lib/content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import { keyed } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("contact");
  return pageMetadata({ ...seo, path: routes.contact });
}

/* Icons pair with the editable promises by position. */
const promiseIcons = [MessageSquareMore, ShieldCheck, UsersRound];

/** Who this page is about: the organisation and how to reach its support team. */
function supportContact(name: string, email: string) {
  return {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name,
    url: absoluteUrl(routes.home),
    email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email,
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
}

export default async function ContactPage() {
  const [content, siteContent, organisation] = await Promise.all([
    getContent("contact"),
    getSiteContent(),
    getOrganisation(),
  ]);
  const { seo, hero, details, promises } = content;
  return (
    <>
      <section className="pt-12 pb-12 md:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-7">
          <div>
            <Eyebrow className="mb-2">{hero.eyebrow}</Eyebrow>
            <h1 className="max-w-[420px] text-[32px] font-extrabold leading-[1.25] tracking-[-0.01em] sm:text-[40px] md:text-5xl md:leading-[1.45]">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-[600px] text-base leading-relaxed sm:text-xl sm:leading-[1.6] md:text-[22px] md:leading-8">
              {hero.lead}
            </p>

            <div className="mt-9 space-y-8 md:mt-10 md:space-y-10">
              <div className="flex items-center gap-4">
                <IconBadge
                  icon={Mail}
                  size="lg"
                  className="bg-[#ebf7f1] text-ink"
                />
                <div>
                  <h2 className="text-sm font-semibold leading-5">
                    {details.email_title}
                  </h2>
                  <p className="mt-1.5 max-w-[290px] text-xs leading-4">
                    {details.email_text}
                  </p>
                  <a
                    href={`mailto:${organisation.email}`}
                    className="-my-2.5 inline-block py-3 text-xs text-primary underline underline-offset-2 hover:text-primary-dark"
                  >
                    {organisation.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <IconBadge icon={Clock} tone="peach" size="lg" />
                <div>
                  <h2 className="text-sm font-semibold leading-5">
                    {details.hours_title}
                  </h2>
                  <p className="mt-1.5 text-xs leading-6">
                    {siteContent.contact.hours_days}
                    <br />
                    {siteContent.contact.hours_time}
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
              {keyed(promises.items, (item) => item.title).map(
                ({ item: promise, key }, index) => (
                  <li
                    key={key}
                    className="flex items-center gap-4 sm:px-6 lg:min-h-32"
                  >
                    <IconBadge
                      icon={promiseIcons[index % promiseIcons.length]}
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
                ),
              )}
            </ul>
          </div>
        </Container>
      </section>

      <ClosingSection page="contact" />

      <LocationsDirectory />

      <PageSchema
        title={seo.title}
        description={seo.description}
        path={routes.contact}
        type="ContactPage"
        crumb="Contact Us"
        extra={{
          mainEntity: supportContact(organisation.name, organisation.email),
        }}
      />
    </>
  );
}
