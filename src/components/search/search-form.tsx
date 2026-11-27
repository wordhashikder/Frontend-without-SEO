"use client";

import { Building2, ChevronDown, MapPin, Search } from "lucide-react";
import { useId, useState } from "react";
import {
  SEARCH_DISTANCES,
  type SearchFilters,
  type SearchTab,
  tabFor,
} from "@/lib/search";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

const TABS: { key: SearchTab; label: string; icon: typeof Search }[] = [
  { key: "general", label: "General search", icon: Search },
  { key: "city", label: "Search by city", icon: MapPin },
  { key: "company", label: "Company name", icon: Building2 },
];

const FIELD: Record<
  SearchTab,
  { name: "q" | "location" | "company"; placeholder: string; label: string }
> = {
  general: {
    name: "q",
    placeholder: "Postcode, city, company or keyword",
    label: "Postcode, city, company or keyword",
  },
  city: { name: "location", placeholder: "Town or city", label: "City" },
  company: {
    name: "company",
    placeholder: "Company name",
    label: "Company name",
  },
};

/**
 * The three ways to search. It is a plain GET form to the search page (/uk/search/), so a search is a link that can
 * be shared and works without JavaScript; the tabs only change which box is shown.
 */
export function SearchForm({
  filters,
  cities,
}: {
  filters: SearchFilters;
  /** Town names, offered as suggestions in the city tab. */
  cities: string[];
}) {
  const id = useId();
  const [tab, setTab] = useState<SearchTab>(() => tabFor(filters));
  const field = FIELD[tab];
  const value = filters[field.name];

  return (
    <div className="rounded-2xl border border-line bg-white p-3 shadow-card sm:p-4">
      <div
        role="tablist"
        aria-label="How to search"
        className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2"
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`${id}-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`${id}-panel`}
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-2 py-1.5 text-center text-sm leading-tight font-semibold sm:px-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              tab === key
                ? "bg-primary-soft text-forest"
                : "text-ink hover:bg-surface",
            )}
          >
            <Icon aria-hidden className="hidden size-4 shrink-0 sm:block" />
            {label}
          </button>
        ))}
      </div>

      <form
        action={routes.search}
        method="get"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${tab}`}
        className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        {/* Keep what a link already narrowed to (a service, an accreditation). */}
        {filters.service ? (
          <input type="hidden" name="service" value={filters.service} />
        ) : null}
        {filters.accreditation ? (
          <input
            type="hidden"
            name="accreditation"
            value={filters.accreditation}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-line sm:flex-row">
          <label
            htmlFor={`${id}-field`}
            className="flex min-w-0 flex-1 cursor-text items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-4"
          >
            <Search aria-hidden className="size-4 shrink-0 text-muted" />
            <span className="sr-only">{field.label}</span>
            <input
              // A new box for each tab, so the text typed in another one is not carried over.
              key={tab}
              id={`${id}-field`}
              name={field.name}
              type="search"
              defaultValue={value}
              maxLength={100}
              placeholder={field.placeholder}
              autoComplete="off"
              list={tab === "city" ? `${id}-cities` : undefined}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-subtle sm:text-[15px]"
            />
            {tab === "city" ? (
              <datalist id={`${id}-cities`}>
                {cities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            ) : null}
          </label>

          {tab === "general" ? (
            <label
              htmlFor={`${id}-distance`}
              className="relative flex items-center gap-3 border-t border-line px-4 py-2.5 sm:min-w-[170px] sm:border-t-0 sm:border-l"
            >
              <MapPin aria-hidden className="size-4 shrink-0 text-muted" />
              <span className="flex flex-1 flex-col">
                <span className="text-xs font-semibold leading-tight text-ink">
                  Distance
                </span>
                <select
                  id={`${id}-distance`}
                  name="distance"
                  defaultValue={filters.distance}
                  className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[15px] font-semibold text-ink outline-none"
                >
                  {SEARCH_DISTANCES.map((miles) => (
                    <option key={miles} value={miles}>
                      {miles} miles
                    </option>
                  ))}
                </select>
              </span>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-4 size-4 text-muted"
              />
            </label>
          ) : null}
        </div>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgb(10_155_83/0.3)] transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Search aria-hidden className="size-4" />
          Find Electricians
        </button>
      </form>
      {tab === "general" ? (
        <p className="mt-2 px-1 text-sm text-subtle">
          Enter a postcode to see electricians within the distance you choose.
        </p>
      ) : null}
    </div>
  );
}
