import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  INSTALLERS_PER_PAGE,
  MAX_LISTING_PAGE,
} from "@/components/directory/installer-listing";
import { LocationView } from "@/components/directory/location-view";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { locationPath } from "@/lib/site";
import { loadLocation, locationMetadata } from "../../location-data";

/*
 * "Load More" target: the location page with `number` pages of installers
 * (12 each, cumulative). It is a path segment rather than `?page=` because
 * reading `searchParams` would make the location page render on every request;
 * as a sibling route both stay ISR-cached and the link works without JavaScript.
 */
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = PageProps<"/uk/ev-charger-installers/[location]/page/[number]">;

async function load({ params }: Pick<Props, "params">) {
  const { location: slug, number } = await params;
  if (!/^[1-9]\d?$/.test(number)) notFound();

  const page = Number(number);
  if (page === 1) permanentRedirect(locationPath(slug));
  if (page > MAX_LISTING_PAGE) notFound();

  const data = await loadLocation(slug, page);
  // A page beyond the last one would only repeat the previous page.
  if (!data || (page - 1) * INSTALLERS_PER_PAGE >= data.total) notFound();

  return { slug, page, data };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { data, page } = await load(props);
  return locationMetadata(data.location, data.total, page);
}

export default async function LocationListingPage(props: Props) {
  const { slug, page, data } = await load(props);

  return (
    <>
      <LocationView {...data} page={page} />
      <LocationsDirectory near={slug} />
    </>
  );
}
