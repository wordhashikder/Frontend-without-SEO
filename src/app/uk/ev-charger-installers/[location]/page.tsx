import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationView } from "@/components/directory/location-view";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { ClosingBlock } from "@/components/sections/closing-section";
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
  return locationMetadata(data.location, data.content.seo, data.total);
}

export default async function LocationPage({ params }: Props) {
  const { location: slug } = await params;
  const data = await loadLocation(slug);
  if (!data) notFound();

  return (
    <>
      <LocationView {...data} page={1} />
      <ClosingBlock
        closing={{
          ...data.content.closing,
          // A town's own text replaces the template's title and text.
          ...(data.location.extra_title || data.location.extra_body
            ? {
                title: data.location.extra_title ?? "",
                body: data.location.extra_body ?? "",
              }
            : {}),
        }}
      />
      <LocationsDirectory />
    </>
  );
}
