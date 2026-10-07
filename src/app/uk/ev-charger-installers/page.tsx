import type { Metadata } from "next";
import { LocationsIndex } from "@/components/directory/locations-index";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { Breadcrumbs } from "@/components/sections/breadcrumbs";
import { JsonLd } from "@/components/sections/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { PageSchema } from "@/components/sections/page-schema";
import { PostcodeForm } from "@/components/sections/postcode-form";
import { Container } from "@/components/ui/layout";
import { api } from "@/lib/api";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { locationPath, routes } from "@/lib/site";

// The list of locations changes rarely; refresh it hourly.
export const revalidate = 3600;

const page = {
  title: "EV Charger Installers Near You",
  description:
    "Find EV charger installers near you. Browse vetted local electricians by UK town or city, or enter your postcode to compare up to 5 free quotes.",
  path: routes.installers,
};

export const metadata: Metadata = pageMetadata(page);

export default async function InstallersHubPage() {
  const locations = await api.locations();

  return (
    <>
      <Container className="pt-5">
        <Breadcrumbs
          items={[
            { name: "Home", path: routes.home },
            { name: "EV Charger Installers", path: routes.installers },
          ]}
        />
      </Container>
      <PageHero
        eyebrow="EV charger installers"
        title="Find EV charger installers near you"
        lead="Browse trusted, vetted EV charger installers by town or city, or enter your postcode to compare up to 5 free quotes from installers who cover your area."
        className="pt-8 md:pt-12"
      >
        <PostcodeForm id="hub-postcode" className="mt-8 max-w-[672px]" />
      </PageHero>

      <LocationsIndex locations={locations} />
      <LocationsDirectory />

      <PageSchema {...page} type="CollectionPage" />
      {locations.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "EV charger installers by UK location",
            numberOfItems: locations.length,
            itemListElement: locations.map((location, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `EV charger installers in ${location.name}`,
              url: absoluteUrl(locationPath(location.slug)),
            })),
          }}
        />
      ) : null}
    </>
  );
}
