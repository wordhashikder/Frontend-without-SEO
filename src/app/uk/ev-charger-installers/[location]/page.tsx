import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationView } from "@/components/directory/location-view";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { loadLocation, locationMetadata } from "./location-data";

// Rendered on first request, then cached and refreshed every 5 minutes (ISR).
// Nothing is fetched at build time: the API is not reachable during image builds.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = PageProps<"/uk/ev-charger-installers/[location]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location: slug } = await params;
  const data = await loadLocation(slug);
  if (!data) notFound();
  return locationMetadata(data.location, data.total);
}

export default async function LocationPage({ params }: Props) {
  const { location: slug } = await params;
  const data = await loadLocation(slug);
  if (!data) notFound();

  return (
    <>
      <LocationView {...data} page={1} />
      <LocationsDirectory near={slug} />
    </>
  );
}
