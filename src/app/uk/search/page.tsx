import { Award, HardHat, MapPin, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { SearchForm } from "@/components/search/search-form";
import { FeatureCard } from "@/components/sections/feature-blocks";
import { InstallerCard } from "@/components/sections/installer-card";
import { JsonLd } from "@/components/sections/json-ld";
import { ButtonLink } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/layout";
import { serviceLabels } from "@/content/labels";
import { api } from "@/lib/api";
import { getClientIp } from "@/lib/request";
import {
  isFiltered,
  readFilters,
  SERVICE_SLUGS,
  type SearchFilters,
  searchHref,
} from "@/lib/search";
import { pageMetadata, webPageSchema } from "@/lib/seo";
import { routes } from "@/lib/site";
import type { LocationSummary } from "@/lib/types";

const PER_PAGE = 12;
const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const TITLE = "Find and Compare Electricians";
const DESCRIPTION =
  "Search and compare verified local electricians and electrical service providers by postcode, town or company name, and check their accreditations.";

type Props = PageProps<"/uk/search">;

/** Every link to a narrowed search is kept out of Google's index, but its links are followed. */
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const filters = readFilters(await searchParams);
  const filtered = isFiltered(filters) || filters.page > 1;
  return {
    ...pageMetadata({
      title: TITLE,
      description: DESCRIPTION,
      path: routes.search,
      index: !filtered,
      followLinks: true,
    }),
    // A narrowed search has no address of its own to point Google at.
    ...(filtered ? { alternates: {} } : {}),
  };
}

const trust = [
  { icon: Award, text: "Accredited electricians" },
  { icon: MapPin, text: "Local coverage across the UK" },
  { icon: ShieldCheck, text: "Verified company details" },
  { icon: Users, text: "Trusted by homeowners" },
] as const;

const why = [
  {
    icon: ShieldCheck,
    tone: "mint",
    title: "Verified Company Details",
    text: "We check available business registration information to help customers identify legitimate companies.",
  },
  {
    icon: Award,
    tone: "peach",
    title: "Qualified & Accredited Professionals",
    text: "Explore installer qualifications and accreditations to find professionals suited to your project.",
  },
  {
    icon: Users,
    tone: "sand",
    title: "Compare With Confidence",
    text: "Review installer experience, services and coverage areas before deciding who to contact.",
  },
  {
    icon: HardHat,
    tone: "peach",
    title: "Choose the Right Expert",
    text: "Find professionals whose services and experience match your specific installation requirements.",
  },
] as const;

const titleCase = (value: string) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());

/** "EV Charger Installation in Bradford" or "Electricians in Bradford", from what the link asks for. */
function resultsTitle(filters: SearchFilters, locations: LocationSummary[]) {
  const service = filters.service
    ? serviceLabels[SERVICE_SLUGS[filters.service]]
    : "Electricians";
  if (filters.location) {
    const wanted = filters.location.toLowerCase();
    const known = locations.find(
      (item) =>
        item.slug === wanted.replace(/\s+/g, "-") ||
        item.name.toLowerCase() === wanted,
    );
    return `${service} in ${known?.name ?? titleCase(filters.location)}`;
  }
  if (filters.q) {
    return POSTCODE.test(filters.q)
      ? `${service} near ${filters.q.toUpperCase()}`
      : `${service} matching “${filters.q}”`;
  }
  if (filters.company) return `${service} named “${filters.company}”`;
  return filters.service ? service : "Electricians across the UK";
}

export default async function SearchPage({ searchParams }: Props) {
  const filters = readFilters(await searchParams);
  const [clientIp, locations] = await Promise.all([
    getClientIp(),
    api.locations(),
  ]);
  const places = locations ?? [];
  const response = await api.searchInstallers(
    {
      q: filters.q,
      company: filters.company,
      location: filters.location,
      service: filters.service ? SERVICE_SLUGS[filters.service] : undefined,
      accreditation: filters.accreditation,
      distance: filters.q ? filters.distance : undefined,
      page: 1,
      // "Load more" shows the same list, longer.
      pageSize: PER_PAGE * filters.page,
    },
    clientIp,
  );
  const results = response.status === "ok" ? response.results : null;
  const hasMore = results
    ? results.items.length < results.total && filters.page < 8
    : false;

  return (
    <>
      <JsonLd
        data={webPageSchema({
          type: "SearchResultsPage",
          title: TITLE,
          description: DESCRIPTION,
          path: routes.search,
          breadcrumb: false,
        })}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-surface to-white">
        <Container
          size="narrow"
          className="pt-6 pb-10 sm:pt-9 lg:pt-[49px] lg:pb-14"
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-forest">
            Electrical Services Marketplace
          </p>
          <h1 className="mt-5 max-w-[640px] text-[34px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-5xl sm:leading-[1.17]">
            Find and Compare Electricians in Your Area
          </h1>
          <p className="mt-6 max-w-[600px] text-base leading-relaxed">
            Search and compare verified local electricians and electrical
            service providers. Find the right specialist for your home or
            business.
          </p>
          <div className="mt-8 max-w-[860px]">
            <SearchForm
              filters={filters}
              cities={places.map((place) => place.name)}
            />
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
            {trust.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <Icon
                  aria-hidden
                  className="size-7 shrink-0 text-primary"
                  strokeWidth={1.5}
                />
                <span className="font-medium text-ink">{text}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Results */}
      <Section
        spacing="sm"
        aria-labelledby="results-heading"
        className="md:pb-20"
      >
        <Container>
          <SectionHeading
            id="results-heading"
            eyebrow="Search Results"
            title={resultsTitle(filters, places)}
          />
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed">
            Browse and compare trusted local professionals to find the right
            expert for your project.
          </p>

          {response.status === "postcode_not_found" ? (
            <Notice title="We couldn’t find that postcode">
              Check it and try again, or search by town or company name.
            </Notice>
          ) : response.status === "unavailable" ? (
            <Notice title="Search is unavailable right now">
              Please try again in a moment.
            </Notice>
          ) : results && results.items.length === 0 ? (
            <Notice title="No electricians match that search">
              Try a different postcode, a wider distance or fewer words, or{" "}
              <a
                className="font-semibold text-primary underline"
                href={routes.quotes}
              >
                tell us what you need
              </a>{" "}
              and we&apos;ll match you with electricians.
            </Notice>
          ) : results ? (
            <>
              <p className="sr-only" role="status">
                Showing {results.items.length} of {results.total} electricians.
              </p>
              <p className="mt-6 text-sm font-medium text-ink">
                {results.total}{" "}
                {results.total === 1 ? "electrician" : "electricians"} found
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {results.items.map((installer) => (
                  <li key={installer.slug}>
                    <InstallerCard installer={installer} />
                  </li>
                ))}
              </ul>
              {hasMore ? (
                <div className="mt-6 text-center">
                  <ButtonLink
                    href={searchHref({ ...filters, page: filters.page + 1 })}
                    scroll={false}
                    arrow
                  >
                    Load More
                  </ButtonLink>
                </div>
              ) : null}
            </>
          ) : null}
        </Container>
      </Section>

      {/* Why */}
      <Section spacing="sm" aria-labelledby="why-heading" className="md:pb-20">
        <Container>
          <Eyebrow className="mb-2">Why choose PickASparky?</Eyebrow>
          <h2
            id="why-heading"
            className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[32px] md:text-4xl"
          >
            Quality Installers. Greater Confidence.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((item) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                tone={item.tone}
                title={item.title}
                text={item.text}
              />
            ))}
          </div>
        </Container>
      </Section>

      <LocationsDirectory />
    </>
  );
}

function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="mt-10 rounded-2xl bg-mint-soft px-6 py-12 text-center sm:px-10 sm:py-14"
    >
      <h3 className="text-xl font-extrabold tracking-[-0.01em] sm:text-2xl">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed">
        {children}
      </p>
    </div>
  );
}
