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

/** Body paragraph for a policy section. */
export function LegalText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-base leading-relaxed sm:text-lg sm:leading-8">
      {children}
    </p>
  );
}

/** Green-bulleted list for a policy section. */
export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-2.5 pl-4 text-base leading-relaxed sm:mt-6 sm:space-y-3 sm:text-lg sm:leading-8">
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-5 before:absolute before:top-[0.8em] before:left-0 before:size-[5px] before:rounded-full before:bg-primary"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Inline link styled for policy copy. */
export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}
