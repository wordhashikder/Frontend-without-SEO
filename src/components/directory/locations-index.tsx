import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { locationPath, routes } from "@/lib/site";
import type { LocationSummary } from "@/lib/types";

/** Locations grouped by region, regions and locations in alphabetical order. */
function groupByRegion(locations: LocationSummary[]) {
  const groups = new Map<string, LocationSummary[]>();
  for (const location of locations) {
    const region = location.region || "Other locations";
    groups.set(region, [...(groups.get(region) ?? []), location]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en-GB"))
    .map(([region, items]) => ({
      region,
      items: items.sort((a, b) => a.name.localeCompare(b.name, "en-GB")),
    }));
}

/** Every location page, as crawlable link lists under a heading per region. */
export function LocationsIndex({
  locations,
}: {
  locations: LocationSummary[];
}) {
  const groups = groupByRegion(locations);

  return (
    <Section spacing="sm" aria-labelledby="browse-heading" className="md:pb-20">
      <Container>
        <SectionHeading
          id="browse-heading"
          eyebrow="Browse by location"
          title="EV charger installers by town and city"
          lead="Choose your nearest town or city to see the installers who cover it."
        />

        {groups.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-mint-soft px-6 py-12 text-center sm:px-10 sm:py-14">
            <h3 className="text-xl font-extrabold tracking-[-0.01em] sm:text-2xl">
              Our location list is being updated
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed">
              You can still enter your postcode and we&apos;ll match you with
              installers who cover your area.
            </p>
            <ButtonLink href={routes.quotes} arrow className="mt-7">
              Get Free Quotes
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-10 space-y-10 md:space-y-12">
            {groups.map(({ region, items }) => (
              <section key={region} aria-label={region}>
                <h3 className="text-lg font-extrabold tracking-[-0.01em] sm:text-xl">
                  {region}
                </h3>
                <ul className="mt-3 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((location) => (
                    <li key={location.slug} className="border-b border-line">
                      <Link
                        href={locationPath(location.slug)}
                        className="group flex min-h-11 items-center justify-between gap-3 py-2.5 text-sm text-muted hover:text-ink"
                      >
                        <span>
                          EV charger installers in{" "}
                          <span className="font-medium text-ink">
                            {location.name}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {location.installer_count > 0 ? (
                            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-forest">
                              {location.installer_count}{" "}
                              {location.installer_count === 1
                                ? "installer"
                                : "installers"}
                            </span>
                          ) : null}
                          <ChevronRight
                            aria-hidden
                            className="size-3.5 opacity-70 transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
