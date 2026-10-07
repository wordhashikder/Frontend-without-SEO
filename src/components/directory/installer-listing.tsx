import { InstallerCard } from "@/components/sections/installer-card";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/lib/site";
import type { InstallerCard as Installer } from "@/lib/types";

/** Installers per "Load More" step, and the most a location page will list. */
export const INSTALLERS_PER_PAGE = 12;
export const MAX_INSTALLERS = 96;
export const MAX_LISTING_PAGE = MAX_INSTALLERS / INSTALLERS_PER_PAGE;

/** Page 1 is the location page itself; later pages get their own cacheable path. */
export const listingPagePath = (basePath: string, page: number) =>
  page <= 1 ? basePath : `${basePath}page/${page}/`;

/** Anchor on the first card added by the latest "Load More" step. */
const NEW_ITEMS_ID = "more-installers";

type InstallerListingProps = {
  city: string;
  installers: Installer[];
  /** All installers covering the location, not just the ones shown. */
  total: number;
  /** How many "pages" of installers are currently shown (cumulative). */
  page: number;
  /** The location page path; further pages live at `{basePath}page/{n}/`. */
  basePath: string;
};

/**
 * Card grid with a "Load More" link. The link is a real URL that renders the
 * longer list on the server, so it works without JavaScript and for crawlers.
 */
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

  const firstNew = (page - 1) * INSTALLERS_PER_PAGE;
  const hasMore =
    page < MAX_LISTING_PAGE &&
    installers.length < Math.min(total, MAX_INSTALLERS);

  return (
    <>
      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {installers.map((installer, index) => (
          <li
            key={installer.slug}
            id={page > 1 && index === firstNew ? NEW_ITEMS_ID : undefined}
          >
            <InstallerCard installer={installer} />
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status">
        Showing {installers.length} of {total} installers covering {city}.
      </p>
      {hasMore ? (
        <div className="mt-6 text-center">
          <ButtonLink
            href={`${listingPagePath(basePath, page + 1)}#${NEW_ITEMS_ID}`}
            scroll={false}
            arrow
          >
            Load More
          </ButtonLink>
        </div>
      ) : null}
    </>
  );
}
