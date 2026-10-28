import { locationPath } from "@/lib/site";
import type { LocationRef } from "@/lib/types";

/** "St. Helens", "st helens" and "St Helens" are the same place. */
const normalise = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * The location page for each area an installer lists, by name.
 *
 * `locations` is the list of published location pages, so an area without a page
 * (or whose page is still a draft) gets no entry and is shown as plain text: no
 * link ever leads to a 404. The result maps the area as written to its page path.
 */
export function areaLinks(
  areas: string[],
  locations: LocationRef[],
): Record<string, string> {
  const pages = new Map<string, string>();
  for (const { name, slug } of locations) {
    for (const key of [normalise(name), normalise(slug)]) {
      if (key && !pages.has(key)) pages.set(key, slug);
    }
  }
  const links: Record<string, string> = {};
  for (const area of areas) {
    const slug = pages.get(normalise(area));
    if (slug) links[area] = locationPath(slug);
  }
  return links;
}
