import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, textLink } from "@/components/auth/auth-card";
import { ClaimForm } from "@/components/claim/claim-form";
import { ButtonLink } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";
import { pageMetadata } from "@/lib/seo";
import { installerPath, routes, site } from "@/lib/site";
import type { ClaimPreview } from "@/lib/types";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Claim Your Free Listing",
    description:
      "Take over the free PickASparky listing for your business: set a password, then keep your details, services and accreditations up to date.",
    path: "/installer/claim",
    index: false,
  }),
  // The address carries a claim token: never send it on as a referrer.
  referrer: "no-referrer",
};

type Lookup =
  | { status: "valid"; listing: ClaimPreview }
  | { status: "claimed" }
  | { status: "invalid" }
  | { status: "unavailable" };

async function lookUp(token: string): Promise<Lookup> {
  if (!token || token.length > 2048) return { status: "invalid" };
  try {
    return {
      status: "valid",
      listing: await api.claimPreview(token, await getClientIp()),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === "listing_already_claimed")
        return { status: "claimed" };
      if (error.status < 500 && error.status !== 429) {
        return { status: "invalid" };
      }
      return { status: "unavailable" };
    }
    throw error;
  }
}

export default async function ClaimPage({
  searchParams,
}: PageProps<"/installer/claim">) {
  const { token: raw } = await searchParams;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const lookup = await lookUp(token);

  if (lookup.status === "valid") {
    const { listing } = lookup;
    return (
      <AuthCard
        title={`Claim ${listing.business_name}`}
        lead={`Set a password to manage your free listing in ${listing.town}. You'll sign in with the business email below.`}
        footer={
          <p>
            Not your business?{" "}
            <Link href={installerPath(listing.slug)} className={textLink}>
              View the listing
            </Link>{" "}
            or email{" "}
            <a href={`mailto:${site.email}`} className={textLink}>
              {site.email}
            </a>
          </p>
        }
      >
        <ClaimForm token={token} email={listing.email} />
      </AuthCard>
    );
  }

  const notice = {
    claimed: {
      text: "This listing has already been claimed. If the account is yours, sign in or reset your password.",
      action: { href: routes.login, label: "Sign in" },
    },
    invalid: {
      text: "This claim link is invalid or has expired. Links work for 72 hours: ask for a new one from your listing page.",
      action: { href: routes.installers, label: "Find your listing" },
    },
    unavailable: {
      text: "We can't open your claim link right now. This is usually temporary, so please try again in a few minutes.",
      action: { href: routes.home, label: "Back to home" },
    },
  }[lookup.status];

  return (
    <AuthCard title="Claim your listing">
      <div className="space-y-5">
        <FormMessage tone="error">{notice.text}</FormMessage>
        <ButtonLink href={notice.action.href} size="lg" fullWidth arrow>
          {notice.action.label}
        </ButtonLink>
      </div>
    </AuthCard>
  );
}
