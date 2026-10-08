import "server-only";

import type { Metadata } from "next";
import {
  INSTALLERS_PER_PAGE,
  listingPagePath,
  MAX_INSTALLERS,
  MAX_LISTING_PAGE,
} from "@/components/directory/installer-listing";
import { api } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { locationPath } from "@/lib/site";

/**
 * Data for a location page showing `page` cumulative pages of installers.
 * Shared by the location route (page 1) and its `/page/[number]` sibling;
 * `fetch` de-duplicates the calls between generateMetadata and the page.
 */
export async function loadLocation(slug: string, page = 1) {
  const location = await api.location(slug);
  if (!location) return null;

  const [listing, reviews, locations] = await Promise.all([
    api.installers({
      location: slug,
      page: 1,
      pageSize: Math.min(page * INSTALLERS_PER_PAGE, MAX_INSTALLERS),
    }),
    api.featuredReviews(10),
    // Neighbouring towns for the local map (cached for an hour, shared by every page).
    api.locations(),
  ]);

  return {
    location,
    installers: listing?.items ?? [],
    total: listing?.total ?? 0,
    reviews,
    // Coordinates arrived in a later API version; skip entries without them.
    neighbours: locations.filter(
      (place) =>
        Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
    ),
  };
}

/**
 * Every listing page shares one title, description and canonical (the location
 * page itself), because later pages repeat page 1 and only add to it.
 */
export function locationMetadata(
  location: { slug: string; name: string },
  total: number,
  page = 1,
): Metadata {
  const city = location.name;
  const path = locationPath(location.slug);
  const lead = `Compare up to 5 free quotes from vetted EV charger installers in ${city}.`;
  const long = `${lead} Enter your postcode, see trusted local electricians and choose who to contact.`;
  const hasNext =
    page < MAX_LISTING_PAGE &&
    page * INSTALLERS_PER_PAGE < Math.min(total, MAX_INSTALLERS);

  return {
    ...pageMetadata({
      title: `EV Charger Installers in ${city}`,
      description:
        long.length <= 160
          ? long
          : `${lead} Enter your postcode and choose the electrician that suits you.`,
      path,
    }),
    pagination: {
      previous: page > 1 ? listingPagePath(path, page - 1) : null,
      next: hasNext ? listingPagePath(path, page + 1) : null,
    },
  };
}
