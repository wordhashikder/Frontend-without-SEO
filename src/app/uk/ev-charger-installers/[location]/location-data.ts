import "server-only";

import type { Metadata } from "next";
import {
  INSTALLERS_PER_PAGE,
  listingPageCount,
  listingPagePath,
} from "@/components/directory/installer-listing";
import { api } from "@/lib/api";
import { getContent, type PageContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { locationPath } from "@/lib/site";

/**
 * Data for one page of a location's installers (12 per page).
 * Shared by the location route (page 1) and its `/page/[number]` sibling;
 * `fetch` de-duplicates the calls between generateMetadata and the page.
 */
export async function loadLocation(slug: string, page = 1) {
  const location = await api.location(slug);
  if (!location) return null;

  const [listing, reviews, locations, content] = await Promise.all([
    api.installers({
      location: slug,
      page,
      pageSize: INSTALLERS_PER_PAGE,
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
 * Every listing page is its own URL, so each one gets its own canonical, Open
 * Graph URL, title and description: page 1 is the location page itself and page
 * N is `{location}/page/N/`. Pages after the first say "Page N", so no two pages
 * share a title or snippet.
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
  const basePath = locationPath(location.slug);
  const path = listingPagePath(basePath, page);
  const hasNext = page < listingPageCount(total);

  // This location's own snippet (SEO & Locations) wins over the template.
  const suffix = page > 1 ? `: Page ${page}` : "";
  const title = `${location.seo_title ?? seo.title}${suffix}`;
  const description = `${location.seo_description ?? seo.description}${
    page > 1 ? ` (Page ${page})` : ""
  }`;
  // A title written for this location is shown as written, without the brand suffix.
  const base = pageMetadata({
    title,
    description,
    path,
    standalone: location.seo_title ? true : undefined,
  });

  return {
    ...base,
    pagination: {
      previous: page > 1 ? listingPagePath(basePath, page - 1) : null,
      next: hasNext ? listingPagePath(basePath, page + 1) : null,
    },
  };
}
