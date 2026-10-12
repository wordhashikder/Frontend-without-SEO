import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { api } from "@/lib/api";
import { getSiteContent } from "@/lib/content";
import { locationPath } from "@/lib/site";
import type { LocationRef } from "@/lib/types";

function Column({ title, items }: { title: string; items: LocationRef[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
      <ul className="mt-4 sm:mt-6">
        {items.map((item) => (
          <li key={item.slug} className="border-b border-[#dde3ea]">
            <Link
              href={locationPath(item.slug)}
              title={`EV charger installers in ${item.name}`}
              className="flex items-center justify-between gap-3 py-2.5 text-sm text-muted hover:text-ink"
            >
              {item.name}
              <ChevronRight aria-hidden className="size-3.5 opacity-70" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "Find trusted installers in your area": the internal-link hub that closes
 * every page. The four columns and their order are set in the API's location
 * data (the same on every page), and no location is listed twice.
 */
export async function LocationsDirectory() {
  const [directory, siteContent] = await Promise.all([
    api.locationDirectory(),
    getSiteContent(),
  ]);
  if (!directory) return null;
  const labels = siteContent.directory;

  return (
    <Section tone="stone" aria-labelledby="locations-heading">
      <Container>
        <SectionHeading
          id="locations-heading"
          eyebrow={labels.eyebrow}
          title={labels.title}
          align="center"
        />
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 md:mt-12 lg:grid-cols-4 lg:gap-x-20">
          <Column title={labels.nearby} items={directory.nearby} />
          <Column title={labels.popular} items={directory.popular} />
          <Column title={labels.more} items={directory.more_in_area} />
          <Column title={labels.other} items={directory.other} />
        </div>
      </Container>
    </Section>
  );
}
