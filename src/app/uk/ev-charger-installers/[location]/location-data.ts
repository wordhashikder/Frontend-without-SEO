import "server-only";

import type { Metadata } from "next";
import {
  INSTALLERS_PER_PAGE,
  listingPagePath,
  MAX_INSTALLERS,
  MAX_LISTING_PAGE,
} from "@/components/directory/installer-listing";
import { api } from "@/lib/api";
import { getContent, type PageContent } from "@/lib/content";
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

  const [listing, reviews, locations, content] = await Promise.all([
    api.installers({
      location: slug,
      page: 1,
      pageSize: Math.min(page * INSTALLERS_PER_PAGE, MAX_INSTALLERS),
    }),
    api.featuredReviews(10),
    // Neighbouring towns for the local map (cached for an hour, shared by every page).
    api.locations(),
    // The location page template (Dashboard → Website content → Location pages).
    getContent("location", { city: location.name }),
  ]);

  return {
    location,
    content,
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
  location: {
    slug: string;
    seo_title?: string | null;
    seo_description?: string | null;
  },
  seo: PageContent<"location">["seo"],
  total: number,
  page = 1,
): Metadata {
  const path = locationPath(location.slug);
  const hasNext =
    page < MAX_LISTING_PAGE &&
    page * INSTALLERS_PER_PAGE < Math.min(total, MAX_INSTALLERS);

  // This location's own snippet (SEO & Locations) wins over the template.
  const base = pageMetadata({
    title: location.seo_title ?? seo.title,
    description: location.seo_description ?? seo.description,
    path,
  });

  return {
    ...base,
    ...(location.seo_title ? { title: { absolute: location.seo_title } } : {}),
    pagination: {
      previous: page > 1 ? listingPagePath(path, page - 1) : null,
      next: hasNext ? listingPagePath(path, page + 1) : null,
    },
  };
}
