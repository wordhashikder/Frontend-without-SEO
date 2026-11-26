import { ArrowLeft, Eye, Plus } from "lucide-react";
import Link from "next/link";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import {
  PageImage,
  SupportingPages,
} from "@/components/pages/supporting-pages";
import { Breadcrumbs } from "@/components/sections/breadcrumbs";
import { ContentMarkdown } from "@/components/sections/content-markdown";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd } from "@/components/sections/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { QuoteCtaBar } from "@/components/sections/quote-cta-bar";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { faqSchema } from "@/lib/seo";
import { routes } from "@/lib/site";
import type { SitePage } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Answers are Markdown; search engines get them as plain text. */
const plain = (markdown: string) =>
  markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * A page the team created (Dashboard → Website content → Pages): the same layout for every
 * main page and supporting page. A main page lists its supporting pages; a supporting page
 * links back to its main page. A page with no content yet opens with its title and intro.
 */
export function SitePageView({ page }: { page: SitePage }) {
  const { parent } = page;
  const title = page.seo_title ?? page.title;
  const description = page.seo_description ?? page.intro ?? "";
  const crumbs = [
    { name: "Home", path: routes.home },
    ...(parent ? [{ name: parent.title, path: parent.path }] : []),
    { name: page.title, path: page.path },
  ];
  const empty = page.sections.length === 0 && page.faq.length === 0;
  // The page of one accreditation scheme, under the accreditations overview.
  const accreditationPage = parent?.path === routes.accreditations;

  return (
    <>
      {page.preview ? (
        <div
          role="status"
          className="flex items-center justify-center gap-2 bg-ink px-4 py-2 text-center text-xs font-semibold text-white"
        >
          <Eye aria-hidden className="size-4" />
          Preview: only people with this link can see this page. It is not
          published.
        </div>
      ) : null}
      <Container className="pt-6 md:pt-10">
        <Breadcrumbs items={crumbs} />
      </Container>

      <PageHero
        eyebrow={page.eyebrow ?? parent?.title ?? "PickASparky"}
        title={page.title}
        lead={page.intro ?? undefined}
        aside={
          page.hero_image_url ? (
            <PageImage
              src={page.hero_image_url}
              alt={page.hero_image_alt}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          ) : undefined
        }
        className="pt-8 md:pt-10"
      />

      {page.sections.map((section, index) => {
        const imageFirst = index % 2 === 1;
        return (
          <Section
            // Sections have no ids; their order is their identity.
            // biome-ignore lint/suspicious/noArrayIndexKey: the list is rendered once and never reordered on the page
            key={index}
            tone={index % 2 === 1 ? "peach" : "white"}
            aria-labelledby={`section-${index}`}
            className="md:py-16"
          >
            <Container>
              <div
                className={cn(
                  section.image_url &&
                    "grid items-center gap-8 md:grid-cols-2 md:gap-14",
                )}
              >
                <div className={cn(imageFirst && "md:order-2")}>
                  <SectionHeading
                    id={`section-${index}`}
                    title={section.heading}
                    size="lg"
                  />
                  <ContentMarkdown variant="page" className="mt-2">
                    {section.body}
                  </ContentMarkdown>
                </div>
                {section.image_url ? (
                  <PageImage
                    src={section.image_url}
                    alt={section.image_alt}
                    className="h-auto w-full rounded-2xl object-cover"
                  />
                ) : null}
              </div>
            </Container>
          </Section>
        );
      })}

      {page.faq.length ? (
        <Section spacing="sm" aria-labelledby="page-faq" className="md:pb-16">
          <Container>
            <SectionHeading
              id="page-faq"
              eyebrow="Questions"
              title="Frequently asked questions"
              size="lg"
            />
            <div className="mt-8 grid gap-4">
              {page.faq.map((item) => (
                <details
                  key={item.question}
                  className="group h-fit rounded-lg border border-line bg-white shadow-soft"
                >
                  <summary className="flex items-center justify-between gap-4 px-4 py-3.5 text-[13px] font-semibold text-ink sm:px-5 sm:text-sm">
                    <h3 className="font-semibold">{item.question}</h3>
                    <Plus
                      aria-hidden
                      className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-45"
                      strokeWidth={1.75}
                    />
                  </summary>
                  <ContentMarkdown
                    variant="compact"
                    className="px-4 pb-4 sm:px-5"
                  >
                    {item.answer}
                  </ContentMarkdown>
                </details>
              ))}
            </div>
            <JsonLd
              data={faqSchema(
                page.faq.map((item) => ({
                  question: item.question,
                  answer: plain(item.answer),
                })),
              )}
            />
          </Container>
        </Section>
      ) : null}

      <SupportingPages
        pages={page.children}
        title="Explore this topic in more detail"
      />

      {parent ? (
        <Container className="pb-10">
          <Link
            href={parent.path}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to {parent.title}
          </Link>
        </Container>
      ) : null}

      {accreditationPage ? (
        // An accreditation's page closes with the same quote bar as installer profiles.
        <Container className="pt-4 pb-14 md:pb-20">
          <QuoteCtaBar id="page-cta" />
        </Container>
      ) : empty ? null : (
        <CtaBand
          eyebrow="Free and no obligation"
          title="Compare up to 5 free quotes from local EV charger installers"
          lead="Enter your postcode and we'll connect you with vetted, local installers."
        />
      )}

      <LocationsDirectory />

      <PageSchema
        title={title}
        description={description}
        path={page.path}
        breadcrumb
        extra={{
          dateModified: page.updated_at,
          // The picture the team chose for the page, when there is one.
          ...(page.hero_image_url?.startsWith("https://")
            ? { primaryImageOfPage: page.hero_image_url }
            : {}),
        }}
      />
    </>
  );
}
