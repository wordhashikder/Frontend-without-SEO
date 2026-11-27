import type { ServiceKey } from "@/lib/types";

/**
 * The address of each service in a search link (`/search/?service=ev-charger`) and the key
 * the API knows it by. A link with any other value finds nothing and is ignored.
 */
export const SERVICE_SLUGS: Record<string, ServiceKey> = {
  "ev-charger": "ev_charger_installation",
  domestic: "domestic_electrical",
  commercial: "commercial_electrical",
  repairs: "electrical_repairs",
  "solar-battery": "solar_battery",
  "smart-home": "smart_home",
  eicr: "eicr_testing",
};

export const SEARCH_DISTANCES = [5, 10, 15, 25, 50, 100] as const;
export const DEFAULT_DISTANCE = 25;
export const SEARCH_TABS = ["general", "city", "company"] as const;
export type SearchTab = (typeof SEARCH_TABS)[number];

export type SearchParams = {
  q?: string;
  location?: string;
  company?: string;
  service?: string;
  accreditation?: string;
  distance?: string;
  page?: string;
};

export type SearchFilters = {
  q: string;
  location: string;
  company: string;
  /** The slug as written in the link, when it is one we know. */
  service: string;
  accreditation: string;
  distance: number;
  page: number;
};

const one = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? "";

/** What a visitor's link says, cleaned up: unknown services and odd numbers are dropped. */
export function readFilters(
  raw: Record<string, string | string[] | undefined>,
): SearchFilters {
  const service = one(raw.service).toLowerCase();
  const distance = Number(one(raw.distance));
  const page = Number(one(raw.page));
  return {
    q: one(raw.q),
    location: one(raw.location),
    company: one(raw.company),
    service: service in SERVICE_SLUGS ? service : "",
    accreditation: one(raw.accreditation)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ""),
    distance: (SEARCH_DISTANCES as readonly number[]).includes(distance)
      ? distance
      : DEFAULT_DISTANCE,
    page: Number.isInteger(page) && page >= 1 && page <= 8 ? page : 1,
  };
}

/** True when the link narrows the search at all. Such pages are kept out of the index. */
export const isFiltered = (filters: SearchFilters) =>
  Boolean(
    filters.q ||
      filters.location ||
      filters.company ||
      filters.service ||
      filters.accreditation,
  );

/** The tab a link belongs to: the one whose box it fills. */
export function tabFor(filters: SearchFilters): SearchTab {
  if (filters.company && !filters.q && !filters.location) return "company";
  if (filters.location && !filters.q && !filters.company) return "city";
  return "general";
}

/** A search address with only the filters that are set, e.g. `/search/?service=ev-charger`. */
export function searchHref(filters: Partial<SearchFilters>, path = "/search/") {
  const query = new URLSearchParams();
  for (const key of [
    "q",
    "location",
    "company",
    "service",
    "accreditation",
  ] as const) {
    const value = filters[key];
    if (value) query.set(key, value);
  }
  if (filters.q && filters.distance && filters.distance !== DEFAULT_DISTANCE)
    query.set("distance", String(filters.distance));
  if (filters.page && filters.page > 1) query.set("page", String(filters.page));
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}
