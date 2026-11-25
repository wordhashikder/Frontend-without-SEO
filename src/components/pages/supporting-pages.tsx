import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import type { PageCard } from "@/lib/types";

/** Images the team uploads have unknown sizes, so they are plain lazy images. */
export function PageImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string | null;
  className?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: dimensions are unknown for images the team uploads
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

/**
 * The supporting pages of a main page, as cards. Nothing is shown when there are none, so a
 * main page without supporting pages (or with only empty ones) has no empty block.
 */
export function SupportingPages({
  pages,
  eyebrow = "Learn more",
  title = "Explore the topic in more detail",
  className,
}: {
  pages: PageCard[];
  eyebrow?: string;
  title?: string;
  className?: string;
}) {
  if (!pages.length) return null;
  return (
    <Section
      tone="surface"
      aria-labelledby="supporting-pages"
      className={className}
    >
      <Container>
        <SectionHeading
          id="supporting-pages"
          eyebrow={eyebrow}
          title={title}
          size="lg"
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-3 lg:gap-6">
          {pages.map((page) => (
            <li key={page.path}>
              <Link
                href={page.path}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-shadow hover:shadow-md"
              >
                {page.hero_image_url ? (
                  <PageImage
                    src={page.hero_image_url}
                    alt={page.hero_image_alt}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : null}
                <span className="flex flex-1 flex-col p-5 sm:p-6">
                  <span className="text-lg font-extrabold leading-snug tracking-[-0.01em] text-ink sm:text-xl">
                    {page.title}
                  </span>
                  {page.intro ? (
                    <span className="mt-3 flex-1 text-sm leading-relaxed">
                      {page.intro}
                    </span>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Read more
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
