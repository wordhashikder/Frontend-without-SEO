import { EnquiryForm } from "@/components/profile/enquiry-form";
import { enquiryForm } from "@/content/enquiry-form";
import type { InstallerDetail } from "@/lib/types";

type QuoteCardProps = {
  installer: Pick<
    InstallerDetail,
    "slug" | "business_name" | "accepts_direct_quotes"
  >;
};

/**
 * "Request a Quote", the card beside an installer's gallery: a contact form
 * (name, email, optional phone, message) on every installer's profile.
 *
 * Pro and Premium installers receive the request themselves. Free-plan
 * installers are listed only, so their requests go to the PickASparky team;
 * the card's wording says so (see content/enquiry-form.ts).
 */
export function QuoteCard({ installer }: QuoteCardProps) {
  const direct = installer.accepts_direct_quotes;
  return (
    <aside
      aria-labelledby="quote-card-heading"
      className="rounded-xl border border-[#e3efec] bg-mint-soft p-5"
    >
      <h2
        id="quote-card-heading"
        className="text-xl font-bold leading-7 tracking-[-0.01em]"
      >
        {enquiryForm.title}
      </h2>
      <p className="mt-1.5 text-xs leading-5">
        {enquiryForm.lead(installer.business_name, direct)}
      </p>
      <EnquiryForm
        installerSlug={installer.slug}
        businessName={installer.business_name}
        direct={direct}
      />
    </aside>
  );
}
