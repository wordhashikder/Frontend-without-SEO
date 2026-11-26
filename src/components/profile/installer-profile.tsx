import { Clock, MapPin, MapPinned, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ClaimListing } from "@/components/claim/claim-listing";
import { ScrollButton } from "@/components/layout/section-link";
import { CoverageMap } from "@/components/profile/coverage-map";
import { Gallery } from "@/components/profile/gallery";
import { QuoteCard } from "@/components/profile/quote-card";
import { Breadcrumbs } from "@/components/sections/breadcrumbs";
import {
  InstallerCard,
  InstallerLogo,
} from "@/components/sections/installer-card";
import { JsonLd } from "@/components/sections/json-ld";
import { QuoteCtaBar } from "@/components/sections/quote-cta-bar";
import { ReviewCard } from "@/components/sections/reviews";
import { CheckBullet } from "@/components/ui/icon-badge";
import { Container, Eyebrow } from "@/components/ui/layout";
import { StarRating } from "@/components/ui/star-rating";
import { serviceLabels } from "@/content/labels";
import { entityId, installerSchema, webPageSchema } from "@/lib/seo";
import { installerPath, locationPath, routes } from "@/lib/site";
import type {
  AccreditationSchemeInfo,
  InstallerDetail,
  InstallerCard as InstallerSummary,
  Review,
} from "@/lib/types";
import { cn, formatMiles } from "@/lib/utils";

type InstallerProfileProps = {
  installer: InstallerDetail;
  /** Display name of the installer's location, for the breadcrumb trail. */
  locationName: string;
  /** The reviews to render (first page). */
  reviews: Review[];
  similar: InstallerSummary[];
  /** Page path of each listed area that has a published location page, by area name. */
  areaLinks?: Record<string, string>;
  /** The accreditation schemes (names, badges, card text and links to their pages). */
  schemes?: AccreditationSchemeInfo[];
};

/** The page's H2 style: also used by the "We cover ..." title in Areas covered. */
const H2_CLASS =
  "text-2xl font-bold leading-tight tracking-[-0.01em] sm:text-[28px]";

function Heading({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 id={id} className={cn(H2_CLASS, className)}>
      {children}
    </h2>
  );
}

/** Everything on an installer profile between the header and the locations directory. */
export function InstallerProfile({
  installer,
  locationName,
  reviews,
  similar,
  areaLinks = {},
  schemes = [],
}: InstallerProfileProps) {
  const name = installer.business_name;
  const path = installerPath(installer.slug);
  const hasRating = installer.rating_avg !== null && installer.review_count > 0;
  const hasPhotos = installer.photos.length > 0;
  const reviewsLabel = `${installer.review_count} ${installer.review_count === 1 ? "review" : "reviews"}`;
  const paragraphs = (installer.description ?? "")
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean);

  const listedSince = installer.listed_since
    ? new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "Europe/London",
      }).format(new Date(installer.listed_since))
    : null;
  const facts: [string, string][] = [
    ["Based in", `${installer.town} (${installer.postcode_district})`],
    [
      "Service area",
      `Within ${formatMiles(installer.coverage.radius_miles)} ${installer.coverage.radius_miles === 1 ? "mile" : "miles"} of ${installer.town}`,
    ],
    [
      "Services",
      installer.services.map((key) => serviceLabels[key] ?? key).join(", ") ||
        "EV charger installation",
    ],
    ...(installer.years_experience
      ? [
          ["Experience", `${installer.years_experience}+ years`] as [
            string,
            string,
          ],
        ]
      : []),
    ...(listedSince ? [["Listed since", listedSince] as [string, string]] : []),
  ];

  // The facts card (including "Experience") shows even when the business has not written an
  // About text yet, so what they enter on their profile always reaches the public page.
  const about = (
    <section aria-labelledby="about-heading">
      <Heading id="about-heading">About {name}</Heading>
      {paragraphs.length > 0 ? (
        <div className="mt-3 space-y-3 text-sm leading-[1.65]">
          {paragraphs.map((text) => (
            <p key={text} className="whitespace-pre-line">
              {text}
            </p>
          ))}
        </div>
      ) : null}
      <dl
        className={`${paragraphs.length > 0 ? "mt-5" : "mt-3"} grid grid-cols-1 gap-x-8 gap-y-2.5 rounded-xl border border-line bg-white p-5 text-sm shadow-soft sm:grid-cols-[130px_1fr]`}
      >
        {facts.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-subtle">{label}</dt>
            <dd className="font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );

  return (
    <div>
      <Container size="narrow" className="pt-4 pb-14 md:pb-16">
        <Breadcrumbs
          items={[
            { name: "Home", path: routes.home },
            { name: "EV Charger Installers", path: routes.installers },
            {
              name: locationName,
              path: locationPath(installer.location_slug),
            },
            { name, path },
          ]}
        />

        {/*
          Header and gallery on the left; the quote card on the right, level with
          the top of the header as in the design. On phones: header, gallery, card.
        */}
        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[auto_1fr] lg:gap-x-8">
          <header className="lg:col-start-1 lg:row-start-1">
            <div className="flex items-start gap-4 sm:gap-5">
              <InstallerLogo
                name={name}
                logoUrl={installer.logo_url}
                size={112}
                className="max-sm:size-20!"
              />
              <div className="min-w-0 sm:pt-1.5">
                <h1 className="text-[22px] font-bold leading-7 tracking-[-0.01em] sm:text-2xl">
                  {name}
                </h1>
                {installer.tagline ? (
                  <p className="mt-1 text-sm">{installer.tagline}</p>
                ) : null}
                {hasRating && installer.rating_avg !== null ? (
                  <ScrollButton
                    target="reviews"
                    className="mt-2 inline-flex flex-wrap items-center gap-x-2 text-sm hover:underline"
                  >
                    <StarRating rating={installer.rating_avg} />
                    <span className="font-semibold text-ink">
                      {installer.rating_avg.toFixed(1)}
                    </span>
                    <span>({reviewsLabel})</span>
                  </ScrollButton>
                ) : (
                  <p className="mt-2 text-sm text-subtle">No reviews yet</p>
                )}
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                  <li className="flex items-center gap-1.5">
                    <MapPin aria-hidden className="size-4" strokeWidth={1.75} />
                    {installer.town}
                  </li>
                  {installer.verified ? (
                    <li className="flex items-center gap-1.5">
                      <ShieldCheck
                        aria-hidden
                        className="size-4 text-primary"
                        strokeWidth={1.75}
                      />
                      Verified installer
                    </li>
                  ) : null}
                  {installer.years_experience ? (
                    <li className="flex items-center gap-1.5">
                      <Clock
                        aria-hidden
                        className="size-4"
                        strokeWidth={1.75}
                      />
                      {installer.years_experience}+ years experience
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
            {installer.services.length > 0 ? (
              <ul
                aria-label="Services"
                className="mt-5 flex flex-wrap gap-2 sm:mt-4"
              >
                {installer.services.map((service) => (
                  <li
                    key={service}
                    className="rounded-md border border-line bg-[#f9fafb] px-3 py-1.5 text-xs font-medium text-ink/80"
                  >
                    {serviceLabels[service] ?? service}
                  </li>
                ))}
              </ul>
            ) : null}
          </header>

          {/* Gallery, or the description when there are no photos */}
          <div className="lg:col-start-1 lg:row-start-2">
            {hasPhotos ? (
              <Gallery photos={installer.photos} name={name} />
            ) : (
              <>
                {installer.cover_image ? (
                  <figure className="mb-8">
                    <div className="relative aspect-[16/6] overflow-hidden rounded-xl bg-surface">
                      <Image
                        src={installer.cover_image.url}
                        alt={
                          installer.cover_image.alt ??
                          `${installer.town} street scene`
                        }
                        fill
                        sizes="(min-width: 1024px) 760px, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-2 text-xs text-subtle">
                      {installer.town}, where {name} is based.
                      {installer.cover_image.credit
                        ? ` Photo: ${installer.cover_image.credit}.`
                        : ""}
                    </figcaption>
                  </figure>
                ) : null}
                {about}
              </>
            )}
          </div>

          <div className="max-lg:mt-2 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <QuoteCard installer={installer} />
            {installer.is_claimed === false ? (
              <ClaimListing slug={installer.slug} businessName={name} />
            ) : null}
          </div>
        </div>

        <div className="mt-12 space-y-12">
          {hasPhotos ? about : null}

          {installer.accreditations.length > 0 ? (
            <section aria-labelledby="accreditations-heading">
              <Eyebrow>Trusted standards</Eyebrow>
              <Heading id="accreditations-heading" className="mt-2">
                Accreditations &amp; Registrations
              </Heading>
              <span
                aria-hidden
                className="mt-3 block h-1 w-12 rounded-full bg-primary"
              />
              <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {installer.accreditations.map((accreditation) => {
                  const scheme = schemes.find(
                    (item) => item.key === accreditation.scheme,
                  );
                  const name =
                    scheme?.name ?? accreditation.scheme.toUpperCase();
                  // The scheme's page, once the team has published it with content.
                  const href = scheme?.href ?? null;
                  return (
                    <li
                      key={accreditation.scheme}
                      className={cn(
                        "relative flex flex-col rounded-2xl border border-line bg-white p-6 shadow-soft",
                        href &&
                          "transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary/50",
                      )}
                    >
                      <p className="text-3xl font-extrabold leading-none tracking-[-0.02em] text-ink">
                        {href ? (
                          // The whole card is the link: this one stretches over it.
                          <Link
                            href={href}
                            className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                          >
                            {name}
                            <span className="sr-only">
                              : read about this accreditation
                            </span>
                          </Link>
                        ) : (
                          name
                        )}
                      </p>
                      {scheme?.badge ? (
                        <span className="mt-4 inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-forest">
                          {scheme.badge}
                        </span>
                      ) : null}
                      <h3 className="mt-4 text-base font-bold text-ink">
                        {scheme?.card_title ?? name}
                      </h3>
                      {scheme?.card_text ? (
                        <p className="mt-2 flex-1 text-sm leading-relaxed">
                          {scheme.card_text}
                        </p>
                      ) : (
                        <span className="flex-1" />
                      )}
                      {accreditation.verified ? (
                        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary-dark">
                          <CheckBullet className="size-4" />
                          Verified by PickASparky
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="areas-heading">
            <Heading id="areas-heading">Areas covered</Heading>
            <span
              aria-hidden
              className="mt-2 block h-1 w-[60px] rounded-full bg-primary"
            />
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,543fr)_minmax(0,520fr)] lg:items-stretch lg:gap-8">
              <CoverageMap
                latitude={installer.coverage.latitude}
                longitude={installer.coverage.longitude}
                radiusMiles={installer.coverage.radius_miles}
                label={`Map of the area covered by ${name}`}
              />
              <div className="flex flex-col justify-center rounded-2xl bg-[#f9f1ea] p-6 sm:p-8">
                <span
                  aria-hidden
                  className="flex size-14 items-center justify-center rounded-full bg-[#cdebdb] text-ink"
                >
                  <MapPinned className="size-7" strokeWidth={1.5} />
                </span>
                <h3 className={cn(H2_CLASS, "mt-5")}>
                  We cover {installer.town} and surrounding areas
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed">
                  This installer&apos;s service area includes {installer.town}{" "}
                  and the surrounding locations.
                </p>
                {installer.areas_covered.length > 0 ? (
                  <ul className="mt-6 columns-1 gap-x-8 text-[15px] min-[420px]:columns-2 sm:text-base">
                    {[...installer.areas_covered, "and nearby areas"].map(
                      (area) => (
                        <li
                          key={area}
                          className="mb-3.5 flex break-inside-avoid items-start gap-2.5"
                        >
                          <CheckBullet className="mt-[3px] size-4 sm:mt-1" />
                          {areaLinks[area] ? (
                            <Link
                              href={areaLinks[area]}
                              className="font-medium text-ink underline decoration-primary/40 decoration-1 underline-offset-4 transition-colors hover:text-primary-dark hover:decoration-primary"
                            >
                              {area}
                            </Link>
                          ) : (
                            area
                          )}
                        </li>
                      ),
                    )}
                  </ul>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-xs">
              Approximate coverage: within{" "}
              {formatMiles(installer.coverage.radius_miles)}{" "}
              {installer.coverage.radius_miles === 1 ? "mile" : "miles"} of{" "}
              {installer.town}.
            </p>
          </section>

          <section id="reviews" aria-labelledby="reviews-heading">
            <Heading id="reviews-heading">Reviews</Heading>
            {hasRating && installer.rating_avg !== null ? (
              <p className="mt-2 flex flex-wrap items-center gap-x-2.5 text-sm">
                <StarRating rating={installer.rating_avg} />
                <span className="font-semibold text-ink">
                  {installer.rating_avg.toFixed(1)} out of 5
                </span>
                <span>({reviewsLabel})</span>
              </p>
            ) : null}
            {reviews.length > 0 ? (
              <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                  <li key={review.id}>
                    <ReviewCard review={review} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-lg border border-line bg-surface px-5 py-6 text-sm">
                {installer.review_count > 0 ? (
                  "We couldn't load the reviews just now. Please try again shortly."
                ) : (
                  <>
                    <span className="font-semibold text-ink">
                      No reviews yet.
                    </span>{" "}
                    Reviews from customers will appear here once they have been
                    published.
                  </>
                )}
              </p>
            )}
            {reviews.length > 0 && installer.review_count > reviews.length ? (
              <p className="mt-4 text-xs">
                Showing the {reviews.length} most recent of{" "}
                {installer.review_count} reviews.
              </p>
            ) : null}
          </section>

          {similar.length > 0 ? (
            <section aria-labelledby="similar-heading">
              <h2 id="similar-heading" className="text-xl font-semibold">
                Similar installers in your area
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {similar.map((item) => (
                  <li key={item.slug}>
                    <InstallerCard installer={item} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Closing call to action */}
        <QuoteCtaBar id="profile-cta" className="mt-14 lg:mt-[76px]" />
      </Container>

      <JsonLd
        data={[
          webPageSchema({
            type: "ProfilePage",
            title: `${name}: EV Charger Installer in ${installer.town}`,
            description:
              installer.tagline ??
              `${name} is an EV charger installer covering ${installer.town}.`,
            path,
            extra: { mainEntity: { "@id": entityId("business", path) } },
          }),
          installerSchema({
            name,
            path,
            town: installer.town,
            description: paragraphs.join(" ") || installer.tagline,
            image: installer.logo_url,
            areasServed: installer.areas_covered,
            rating: {
              average: installer.verified_rating_avg ?? null,
              count: installer.verified_review_count ?? 0,
            },
            reviews,
          }),
        ]}
      />
    </div>
  );
}
