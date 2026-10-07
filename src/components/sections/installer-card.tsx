import { MapPin } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { installerPath } from "@/lib/site";
import type { InstallerCard as Installer } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

/** Square logo tile; falls back to the business initials on brand green. */
export function InstallerLogo({
  name,
  logoUrl,
  size = 64,
  className,
}: {
  name: string;
  logoUrl: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-forest font-bold text-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(12, size / 4.5) }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}

export function InstallerCard({ installer }: { installer: Installer }) {
  // One profile URL per installer, whichever location page shows this card.
  const href = installerPath(installer.slug);
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4">
      <div className="flex items-center gap-4">
        <InstallerLogo
          name={installer.business_name}
          logoUrl={installer.logo_url}
        />
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-ink">
            {installer.business_name}
          </h3>
          {installer.rating_avg !== null && installer.review_count > 0 ? (
            <p className="mt-1 flex items-center gap-2 text-[13px]">
              <StarRating rating={installer.rating_avg} size="sm" />
              <span className="font-semibold text-ink">
                {installer.rating_avg.toFixed(1)}
              </span>
              <span className="text-subtle">({installer.review_count})</span>
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-subtle">No reviews yet</p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-[13px]">
            <MapPin aria-hidden className="size-3.5" />
            {installer.town}
          </p>
        </div>
      </div>
      <ButtonLink
        href={href}
        variant="outline"
        size="sm"
        fullWidth
        aria-label={`View profile: ${installer.business_name}`}
      >
        View Profile
      </ButtonLink>
    </article>
  );
}