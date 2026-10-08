import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import Link from "next/link";
import { FeaturedPost, PostCard } from "@/components/blog/post-card";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { ButtonLink } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Section } from "@/components/ui/layout";
import { blogSchema } from "@/lib/seo";
import { blogListingPath, blogPostPath, routes } from "@/lib/site";
import type { BlogPostSummary, Paginated } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Posts per listing page: the lead story plus a grid of eight on page 1. */
export const POSTS_PER_PAGE = 9;
/** Paths stop at /blog/page/99/; far beyond any realistic archive. */
export const MAX_BLOG_PAGE = 99;

export const blogPage = {
  title: "EV Charging Guides and Advice",
  description:
    "Practical guides to choosing, installing and running a home EV charger in the UK: costs, chargers, installation, regulations and choosing an installer.",
} as const;

function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;
  const linkClass =
    "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30";
  return (
    <nav aria-label="Blog pages" className="mt-12 flex justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <li>
            <Link
              href={blogListingPath(page - 1)}
              rel="prev"
              className={linkClass}
            >
              <ChevronLeft aria-hidden className="size-4" />
              Newer
            </Link>
          </li>
        ) : null}
        {Array.from({ length: pages }, (_, index) => index + 1).map(
          (number) => (
            <li key={number}>
              <Link
                href={blogListingPath(number)}
                aria-current={number === page ? "page" : undefined}
                aria-label={`Page ${number}`}
                className={cn(
                  linkClass,
                  number === page &&
                    "border-primary bg-primary text-white hover:border-primary",
                )}
              >
                {number}
              </Link>
            </li>
          ),
        )}
        {page < pages ? (
          <li>
            <Link
              href={blogListingPath(page + 1)}
              rel="next"
              className={linkClass}
            >
              Older
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

/**
 * A page of the blog listing (page 1 is /blog/, later pages /blog/page/n/).
 * Page 1 opens with the lead story: the newest post marked as featured, or
 * simply the newest post.
 */
export function BlogListing({
  listing,
  page,
}: {
  listing: Paginated<BlogPostSummary>;
  page: number;
}) {
  const posts = listing.items;
  const lead =
    page === 1
      ? (posts.find((post) => post.is_featured) ?? posts[0])
      : undefined;
  const grid = lead ? posts.filter((post) => post !== lead) : posts;
  const path = blogListingPath(page);

  return (
    <>
      <PageHero
        eyebrow="PickASparky Blog"
        title={blogPage.title}
        lead="Clear, practical advice from the PickASparky team on choosing, installing and running a home EV charger."
        className={page > 1 ? "md:pb-8" : undefined}
      >
        {page > 1 ? (
          <p className="mt-4 text-sm font-semibold text-primary">
            Page {page} of {listing.pages}
          </p>
        ) : null}
      </PageHero>

      <Section spacing="sm" className="pt-0 md:pt-0" aria-label="Articles">
        <Container>
          {posts.length === 0 ? (
            <div className="rounded-2xl bg-mint-soft px-6 py-14 text-center sm:px-10">
              <IconBadge
                icon={Newspaper}
                tone="white"
                size="lg"
                className="mx-auto"
              />
              <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.01em]">
                New articles are on their way
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed">
                In the meantime, compare free quotes from vetted EV charger
                installers in your area.
              </p>
              <ButtonLink href={routes.quotes} arrow className="mt-7">
                Get Free Quotes
              </ButtonLink>
            </div>
          ) : (
            <>
              {lead ? <FeaturedPost post={lead} /> : null}
              {grid.length > 0 ? (
                <ul
                  className={cn(
                    "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
                    lead && "mt-10",
                  )}
                >
                  {grid.map((post) => (
                    <li key={post.slug}>
                      <PostCard post={post} headingLevel="h2" />
                    </li>
                  ))}
                </ul>
              ) : null}
              <Pagination page={page} pages={listing.pages} />
            </>
          )}
        </Container>
      </Section>

      <CtaBand
        eyebrow="Ready when you are"
        title="Compare up to 5 free quotes from trusted EV charger installers"
        lead="Answer six quick questions and get quotes from vetted installers who cover your postcode."
      />

      <LocationsDirectory />

      <PageSchema
        type="CollectionPage"
        title={page > 1 ? `${blogPage.title} (page ${page})` : blogPage.title}
        description={blogPage.description}
        path={path}
        crumb={page > 1 ? `Page ${page}` : "Blog"}
        parents={page > 1 ? [{ name: "Blog", path: routes.blog }] : []}
        extra={{
          mainEntity: blogSchema(
            posts.map((post) => ({
              title: post.title,
              path: blogPostPath(post.slug),
              publishedAt: post.published_at,
              image: post.cover_image_url,
            })),
          ),
        }}
      />
    </>
  );
}
