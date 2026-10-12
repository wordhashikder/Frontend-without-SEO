import type { ReactNode } from "react";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { LegalToc } from "@/components/legal/legal-toc";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/layout";

export type LegalSection = {
  /** Anchor id, used by the table of contents. */
  id: string;
  title: string;
  content: ReactNode;
};

type LegalLayoutProps = {
  title: string;
  /** Shown above the title, e.g. "Sept 2026". */
  updated: string;
  sections: LegalSection[];
};

/**
 * Shared layout for the policy pages: title block, "On this page" contents
 * (sticky on desktop, above the copy on mobile) and the sections themselves.
 */
export function LegalLayout({ title, updated, sections }: LegalLayoutProps) {
  return (
    <>
      <PageHero eyebrow={`Last updated: ${updated}`} title={title} />
      <Container className="grid gap-10 pb-6 md:pt-10 md:pb-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-[82px] lg:pt-24">
        <LegalToc items={sections.map(({ id, title }) => ({ id, title }))} />
        <div className="max-w-[800px] text-[#3f5159]">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="pb-10 md:pb-14"
            >
              <h2
                id={`${section.id}-heading`}
                className="text-[22px] font-bold leading-snug sm:text-2xl"
              >
                {section.title}
              </h2>
              {section.content}
            </section>
          ))}
        </div>
      </Container>
      <LocationsDirectory />
    </>
  );
}
