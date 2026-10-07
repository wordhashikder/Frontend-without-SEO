import type { Metadata } from "next";
import { ReviewForm } from "@/components/review/review-form";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/layout";
import { ApiError, api } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import type { ReviewInvite } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Review Your EV Charger Installer",
  description:
    "Share your experience of the installer you found through PickASparky. Reviews are checked before they appear and help other homeowners choose with confidence.",
  path: "/review",
  index: false,
});

type InviteLookup =
  | { status: "valid"; invite: ReviewInvite }
  | { status: "invalid" }
  | { status: "unavailable" };

/** Invitation links are emailed after an installer marks the job as won. */
async function lookUpInvite(token: string): Promise<InviteLookup> {
  if (!token || token.length > 4000) return { status: "invalid" };
  try {
    return { status: "valid", invite: await api.reviewInvite(token) };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400 || error.status === 422)
    ) {
      return { status: "invalid" };
    }
    // An outage must not be reported as an expired link.
    if (error instanceof ApiError) return { status: "unavailable" };
    throw error;
  }
}

export default async function ReviewPage({
  searchParams,
}: PageProps<"/review">) {
  const { token: rawToken } = await searchParams;
  const token =
    (Array.isArray(rawToken) ? rawToken[0] : rawToken)?.trim() ?? "";
  const lookup = await lookUpInvite(token);

  return (
    <section className="bg-gradient-to-b from-surface to-white">
      <Container size="narrow" className="py-8 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-[640px] rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
          {lookup.status === "valid" ? (
            <ReviewForm
              token={token}
              installerName={lookup.invite.installer_name}
            />
          ) : lookup.status === "invalid" ? (
            <Notice
              eyebrow="Review link"
              title="This review link is no longer valid"
              text="Review links can be used once and expire after a while. If you've already left your review, thank you. Otherwise, please use the most recent link in your email."
            />
          ) : (
            <Notice
              eyebrow="Please try again"
              title="We can't open your review link right now"
              text="This is usually temporary. Please try the link from your email again in a few minutes."
            />
          )}
        </div>
      </Container>
    </section>
  );
}

function Notice({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <Eyebrow className="mb-2">{eyebrow}</Eyebrow>
      <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.01em] sm:text-[30px]">
        {title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed">{text}</p>
      <p className="mt-3 text-[15px] leading-relaxed">
        Need a hand? Email{" "}
        <a
          href={`mailto:${site.email}`}
          className="font-medium text-primary underline underline-offset-2"
        >
          {site.email}
        </a>
        .
      </p>
      <ButtonLink href={routes.home} size="lg" arrow className="mt-7">
        Back to home
      </ButtonLink>
    </div>
  );
}
