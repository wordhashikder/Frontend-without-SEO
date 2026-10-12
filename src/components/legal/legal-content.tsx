import { LegalLayout } from "@/components/legal/legal-layout";
import { ContentMarkdown } from "@/components/sections/content-markdown";

type PolicyContent = {
  header: { title: string; updated: string };
  body: { sections: readonly { title: string; body: string }[] };
};

/** "Data We Collect" -> "data-we-collect" (the section's anchor). */
function anchor(title: string, taken: Set<string>) {
  const base =
    title
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section";
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

/**
 * A policy page from its editable content (Dashboard → Website content): each
 * section's Markdown rendered in the policy style, with the contents list.
 */
export function LegalContent({ content }: { content: PolicyContent }) {
  const taken = new Set<string>();
  return (
    <LegalLayout
      title={content.header.title}
      updated={content.header.updated}
      sections={content.body.sections.map((section) => ({
        id: anchor(section.title, taken),
        title: section.title,
        content: (
          <ContentMarkdown variant="legal">{section.body}</ContentMarkdown>
        ),
      }))}
    />
  );
}
