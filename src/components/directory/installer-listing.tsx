import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionLink } from "@/components/layout/section-link";
import { InstallerCard } from "@/components/sections/installer-card";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/lib/site";
import type { InstallerCard as Installer } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Installers per listing page, and the last page a location will have (600 installers). */
export const INSTALLERS_PER_PAGE = 12;
export const MAX_LISTING_PAGE = 50;

/** Page 1 is the location page itself; later pages get their own cacheable path. */
export const listingPagePath = (basePath: string, page: number) =>
  page <= 1 ? basePath : `${basePath}page/${page}/`;

/** How many listing pages a location with `total` installers has. */
export const listingPageCount = (total: number) =>
  Math.min(
    Math.max(Math.ceil(total / INSTALLERS_PER_PAGE), 1),
    MAX_LISTING_PAGE,
  );

/** Page numbers to link to: the first, the last and the neighbours of the current page. */
function visiblePages(page: number, pages: number) {
  const wanted = new Set([1, pages, page - 1, page, page + 1]);
  const numbers = [...wanted]
    .filter((number) => number >= 1 && number <= pages)
    .sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  for (const [index, number] of numbers.entries()) {
    if (index > 0 && number - numbers[index - 1] > 1) items.push("gap");
    items.push(number);
  }
  return items;
}

type InstallerListingProps = {
  city: string;
  installers: Installer[];
  /** All installers covering the location, not just the ones shown. */
  total: number;
  /** The listing page shown (1 = the location page itself). */
  page: number;
  /** The location page path; further pages live at `{basePath}page/{n}/`. */
  basePath: string;
};

const pagerLink =
  "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30";

/**
 * Links to every listing page, so each one (and so each installer) is reachable by
 * crawlers and without JavaScript. The links are plain paths; they take the reader
 * back to the start of the installer list without adding a `#fragment`.
 */
function Pager({
  city,
  page,
  pages,
  basePath,
}: {
  city: string;
  page: number;
  pages: number;
  basePath: string;
}) {
  if (pages <= 1) return null;
  const href = (number: number) => listingPagePath(basePath, number);
  return (
    <nav
      aria-label={`Installers in ${city}`}
      className="mt-10 flex justify-center"
    >
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <li>
            <SectionLink
              href={href(page - 1)}
              section="installers-heading"
              rel="prev"
              className={pagerLink}
            >
              <ChevronLeft aria-hidden className="size-4" />
              Previous
            </SectionLink>
          </li>
        ) : null}
        {visiblePages(page, pages).map((item, index) =>
          item === "gap" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: gaps have no identity
            <li key={`gap-${index}`} aria-hidden className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <SectionLink
                href={href(item)}
                section="installers-heading"
                current={item === page}
                label={`Page ${item}`}
                className={cn(
                  pagerLink,
                  item === page &&
                    "border-primary bg-primary text-white hover:border-primary",
                )}
              >
                {item}
              </SectionLink>
            </li>
          ),
        )}
        {page < pages ? (
          <li>
            <SectionLink
              href={href(page + 1)}
              section="installers-heading"
              rel="next"
              className={pagerLink}
            >
              Next
              <ChevronRight aria-hidden className="size-4" />
            </SectionLink>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

/** One page of installer cards with links to the other pages of the same location. */
export function InstallerListing({
  city,
  installers,
  total,
  page,
  basePath,
}: InstallerListingProps) {
  if (installers.length === 0) {
    return (
      <div className="mt-10 rounded-2xl bg-mint-soft px-6 py-12 text-center sm:px-10 sm:py-14">
        <h3 className="text-xl font-extrabold tracking-[-0.01em] sm:text-2xl">
          We&apos;re still adding installers in {city}
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed">
          Tell us what you need and we&apos;ll match you as soon as one is
          available.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <ButtonLink href={routes.quotes} arrow>
            Get Free Quotes
          </ButtonLink>
          <ButtonLink href={routes.join} variant="link" arrow>
            Are you an installer? Join PickASparky
          </ButtonLink>
        </div>
      </div>
    );
  }

  const first = (page - 1) * INSTALLERS_PER_PAGE + 1;
  const last = first + installers.length - 1;

  return (
    <>
      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {installers.map((installer) => (
          <li key={installer.slug}>
            <InstallerCard installer={installer} />
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status">
        Showing installers {first} to {last} of {total} covering {city}.
      </p>
      <Pager
        city={city}
        page={page}
        pages={listingPageCount(total)}
        basePath={basePath}
      />
    </>
  );
}
