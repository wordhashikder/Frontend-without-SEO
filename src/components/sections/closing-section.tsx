import Image from "next/image";
import { ContentMarkdown } from "@/components/sections/content-markdown";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow, Section } from "@/components/ui/layout";
import { type ContentKey, getContent } from "@/lib/content";

type Closing = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  image_alt: string;
  button_label: string;
  button_link: string;
};

/**
 * The optional section between the reviews and "Find trusted installers in your
 * area" (Dashboard → Website content → a page → Closing section). It renders
 * nothing at all while its title and text are both empty.
 */
export function ClosingBlock({ closing }: { closing: Closing | undefined }) {
  const title = closing?.title?.trim() ?? "";
  const body = closing?.body?.trim() ?? "";
  if (!closing || (!title && !body)) return null;

  const hasButton = Boolean(closing.button_label && closing.button_link);
  return (
    <Section tone="white" spacing="md" aria-label={title || undefined}>
      <Container>
        <div
          className={
            closing.image
              ? "grid items-center gap-8 md:grid-cols-2 md:gap-14"
              : "mx-auto max-w-3xl"
          }
        >
          <div>
            {closing.eyebrow ? <Eyebrow>{closing.eyebrow}</Eyebrow> : null}
            {title ? (
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-ink md:text-3xl">
                {title}
              </h2>
            ) : null}
            {body ? (
              <ContentMarkdown variant="legal" className="mt-2">
                {body}
              </ContentMarkdown>
            ) : null}
            {hasButton ? (
              <ButtonLink
                href={closing.button_link}
                variant="dark"
                className="mt-6"
              >
                {closing.button_label}
              </ButtonLink>
            ) : null}
          </div>
          {closing.image ? (
            <Image
              src={closing.image}
              alt={closing.image_alt}
              width={560}
              height={420}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-auto w-full rounded-2xl object-cover"
            />
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

/** A page's closing section, read from its content (`page` is its content key). */
export async function ClosingSection({
  page,
  vars,
}: {
  page: Exclude<ContentKey, "site">;
  vars?: Record<string, string>;
}) {
  const content = (await getContent(page, vars)) as { closing?: Closing };
  return <ClosingBlock closing={content.closing} />;
}
