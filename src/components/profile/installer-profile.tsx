import {
  BadgeCheck,
  ClipboardCheck,
  Clock,
  Leaf,
  type LucideIcon,
  MapPin,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { CoverageMap } from "@/components/profile/coverage-map";
import { Gallery } from "@/components/profile/gallery";
import { QuoteCard } from "@/components/profile/quote-card";
import { Breadcrumbs } from "@/components/sections/breadcrumbs";
import {
  InstallerCard,
  InstallerLogo,
} from "@/components/sections/installer-card";
import { JsonLd } from "@/components/sections/json-ld";
import { PostcodeForm } from "@/components/sections/postcode-form";
import { ReviewCard } from "@/components/sections/reviews";
import { CheckBullet } from "@/components/ui/icon-badge";
import { Container } from "@/components/ui/layout";
import { StarRating } from "@/components/ui/star-rating";
import { accreditationLabels, serviceLabels } from "@/content/labels";
import { absoluteUrl, installerSchema, webPageSchema } from "@/lib/seo";
import { installerPath, locationPath, routes } from "@/lib/site";
import type {
  AccreditationScheme,
  InstallerDetail,
  InstallerCard as InstallerSummary,
  Review,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const accreditationIcons: Record<AccreditationScheme, LucideIcon> = {
  ozev: Leaf,
  napit: ShieldCheck,
  niceic: BadgeCheck,
  trustmark: ClipboardCheck,
  mcs: Sun,
  elecsa: Zap,
};

type InstallerProfileProps = {
  installer: InstallerDetail;
  /** Display name of the installer's location, for the breadcrumb trail. */
  locationName: string;
  /** The reviews to render (first page). */
  reviews: Review[];
  similar: InstallerSummary[];
};

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
    <h2
      id={id}
      className={cn(
        "text-2xl font-bold leading-tight tracking-[-0.01em] sm:text-[28px]",
        className,
      )}
    >
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

  const about =
    paragraphs.length > 0 ? (
      <section aria-labelledby="about-heading">
        <Heading id="about-heading">About {name}</Heading>
        <div className="mt-3 space-y-3 text-sm leading-[1.65]">
          {paragraphs.map((text) => (
            <p key={text} className="whitespace-pre-line">
              {text}
            </p>
          ))}
        </div>
      </section>
    ) : null;

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
                  <a
                    href="#reviews"
                    className="mt-2 inline-flex flex-wrap items-center gap-x-2 text-sm hover:underline"
                  >
                    <StarRating rating={installer.rating_avg} />
                    <span className="font-semibold text-ink">
                      {installer.rating_avg.toFixed(1)}
                    </span>
                    <span>({reviewsLabel})</span>
                  </a>
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
              about
            )}
          </div>

          <div className="max-lg:mt-2 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <QuoteCard installer={installer} />
          </div>
        </div>

        <div className="mt-12 space-y-12">
          {hasPhotos ? about : null}

          {installer.accreditations.length > 0 ? (
            <section aria-labelledby="accreditations-heading">
              <Heading id="accreditations-heading">
                Accreditations &amp; Registrations
              </Heading>
              <p className="mt-1 text-xs">
                Industry schemes and registrations held by {name}.
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {installer.accreditations.map((accreditation) => {
                  const Icon = accreditationIcons[accreditation.scheme];
                  const label = accreditationLabels[accreditation.scheme];
                  return (
                    <li
                      key={accreditation.scheme}
                      className="flex flex-col rounded-lg border border-line bg-white p-4 shadow-soft"
                    >
                      <span
                        aria-hidden
                        className="inline-flex size-9 items-center justify-center rounded-md bg-[#f0fdf4] text-primary"
                      >
                        <Icon className="size-[18px]" strokeWidth={1.75} />
                      </span>
                      <h3 className="mt-4 text-sm font-semibold">
                        {label.title}
                      </h3>
                      <p className="mt-1.5 flex-1 text-[11px] leading-[15px]">
                        {label.text}
                      </p>
                      {accreditation.registration_number ? (
                        <p className="mt-2 text-[11px] leading-[15px] text-subtle">
                          Registration no. {accreditation.registration_number}
                        </p>
                      ) : null}
                      {accreditation.verified ? (
                        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-primary-dark">
                          <CheckBullet className="size-3.5" />
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
            <div className="mt-5 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,543fr)_minmax(0,520fr)] lg:gap-10">
              <figure>
                <CoverageMap
                  latitude={installer.coverage.latitude}
                  longitude={installer.coverage.longitude}
                  radiusMiles={installer.coverage.radius_miles}
                  label={`Map of the area covered by ${name}`}
                />
                <figcaption className="mt-2 text-xs">
                  Approximate coverage: within {installer.coverage.radius_miles}{" "}
                  {installer.coverage.radius_miles === 1 ? "mile" : "miles"} of{" "}
                  {installer.town}.
                </figcaption>
              </figure>
              <div>
                <h3 className="text-[22px] font-medium leading-[1.5] text-ink sm:text-[28px]">
                  We cover {installer.town} and surrounding areas
                </h3>
                {installer.areas_covered.length > 0 ? (
                  <ul className="mt-6 columns-2 gap-x-8 text-[15px] sm:text-base">
                    {[...installer.areas_covered, "and nearby areas"].map(
                      (area) => (
                        <li
                          key={area}
                          className="mb-3.5 flex break-inside-avoid items-start gap-2.5"
                        >
                          <CheckBullet className="mt-[3px] size-4 sm:mt-1" />
                          {area}
                        </li>
                      ),
                    )}
                  </ul>
                ) : null}
              </div>
            </div>
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
        <section
          aria-labelledby="profile-cta-heading"
          className="mt-14 flex flex-col gap-6 rounded-xl border border-[#e0f5ea] bg-mint-soft p-6 sm:p-8 lg:mt-[76px] lg:flex-row lg:items-center lg:justify-between lg:gap-10"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-dark">
              Ready to get started?
            </p>
            <h2
              id="profile-cta-heading"
              className="mt-2.5 max-w-[440px] text-[22px] font-bold leading-8 tracking-[-0.01em] sm:text-2xl"
            >
              Compare up to 5 quotes from trusted EV charger installers in your
              area
            </h2>
            <p className="mt-2.5 text-sm">
              It&apos;s free, fast and there&apos;s no obligation.
            </p>
          </div>
          <PostcodeForm
            id="profile-cta-postcode"
            variant="inline"
            className="w-full lg:max-w-[442px]"
          />
        </section>
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
            extra: { mainEntity: { "@id": `${absoluteUrl(path)}#business` } },
          }),
          installerSchema({
            name,
            path,
            town: installer.town,
            description: paragraphs.join(" ") || installer.tagline,
            image: installer.logo_url,
            areasServed: installer.areas_covered,
            rating: {
              average: installer.rating_avg,
              count: installer.review_count,
            },
            reviews,
          }),
        ]}
      />
    </div>
  );
}
