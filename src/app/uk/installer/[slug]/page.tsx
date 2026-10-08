import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { InstallerProfile } from "@/components/profile/installer-profile";
import { api } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { installerPath } from "@/lib/site";

// Rendered on first request, then cached and refreshed every 5 minutes (ISR).
// Nothing is fetched at build time: the API is not reachable during image builds.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = PageProps<"/uk/installer/[slug]">;

/**
 * The installer for this profile URL. The slug alone identifies the installer:
 * no location or service is part of the address, so there is exactly one
 * profile URL however many towns the installer covers.
 */
async function loadInstaller({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const installer = await api.installer(slug);
  if (!installer) notFound();
  return installer;
}

/** Longest candidate that fits; search results truncate beyond these lengths. */
const fit = (candidates: string[], max: number) =>
  candidates.find((text) => text.length <= max) ?? candidates.at(-1) ?? "";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const installer = await loadInstaller(props);
  const { business_name: name, town } = installer;
  const path = installerPath(installer.slug);
  // Only promise what the page shows: accreditations depend on the installer's plan.
  const check = `${installer.review_count > 0 ? "Read reviews, check" : "Check"} ${
    installer.accreditations.length > 0 ? "accreditations" : "services"
  }`;
  const intro = `${name} is ${
    installer.verified ? "a verified" : "an"
  } EV charger installer covering ${town}`;

  const fullTitle = `${name}: EV Charger Installer in ${town}`;
  // The root layout appends " | PickASparky" (14 characters) to `title`.
  const title = fit([fullTitle, `${name}: EV Charger Installer`, name], 46);

  const metadata = pageMetadata({
    title,
    description: fit(
      [
        `${intro} and nearby areas. ${check} and areas covered, then request a free, no-obligation quote.`,
        `${intro} and nearby areas. ${check} and areas covered, then request a free quote.`,
        `${intro}. ${check} and areas covered, then request a free quote.`,
        `${intro}. ${check} and request a free quote.`,
        `${intro}. Request a free quote.`,
      ],
      160,
    ),
    path,
  });

  // When the brand suffix would push the title past 60 characters, keep the
  // town (what people search for) and drop the suffix instead.
  if (title !== fullTitle && fullTitle.length <= 60) {
    metadata.title = { absolute: fullTitle };
  }

  const photo = installer.photos[0];
  return photo
    ? {
        ...metadata,
        openGraph: {
          ...metadata.openGraph,
          images: [{ url: photo.url, alt: photo.alt ?? name }],
        },
      }
    : metadata;
}

export default async function InstallerPage(props: Props) {
  const installer = await loadInstaller(props);
  const [location, reviews, similar] = await Promise.all([
    // Only for the breadcrumb label; an outage here must not take the page down.
    api.location(installer.location_slug).catch(() => null),
    api.installerReviews(installer.slug, 1, 6),
    api.similarInstallers(installer.slug, 4),
  ]);

  return (
    <>
      <InstallerProfile
        installer={installer}
        locationName={location?.name ?? installer.town}
        reviews={reviews?.items ?? []}
        similar={similar}
      />
      <LocationsDirectory />
    </>
  );
}
