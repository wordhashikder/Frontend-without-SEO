import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/site";
import type { InstallerDetail } from "@/lib/types";
import { UK_POSTCODE_PATTERN } from "@/lib/utils";

type QuoteCardProps = {
  installer: Pick<
    InstallerDetail,
    "slug" | "business_name" | "town" | "accepts_direct_quotes"
  >;
};

/**
 * Starts the quote flow from a profile. A plain GET form, like PostcodeForm:
 * /get-quotes?installer=<slug>&postcode=M1+1AA. Installers whose plan does not
 * take direct requests get the standard "compare quotes" flow instead.
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
        {direct ? "Request a Quote" : "Compare Quotes"}
      </h2>
      <p className="mt-1.5 text-xs leading-5">
        {direct
          ? `Get in touch with ${installer.business_name} to request a quote for your EV charger installation.`
          : `Compare quotes from installers covering ${installer.town}. It's free and there's no obligation.`}
      </p>
      <form action={routes.quotes} method="get" className="mt-3.5">
        {direct ? (
          <input type="hidden" name="installer" value={installer.slug} />
        ) : null}
        <label
          htmlFor="quote-card-postcode"
          className="block text-sm font-medium text-ink"
        >
          Your postcode
        </label>
        <input
          id="quote-card-postcode"
          name="postcode"
          type="text"
          required
          autoComplete="postal-code"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          maxLength={8}
          pattern={UK_POSTCODE_PATTERN}
          title="Enter a full UK postcode, for example M1 1AA"
          placeholder="e.g. M1 1AA"
          className="mt-2 h-[42px] w-full rounded-lg border border-line bg-[#f9fafb] px-4 text-sm text-ink uppercase transition-colors placeholder:normal-case placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit" arrow fullWidth className="mt-3.5">
          {direct ? "Send Quote Request" : "Get Free Quotes"}
        </Button>
      </form>
      <p className="mt-4 flex gap-2 text-[11px] leading-[15px]">
        <ShieldCheck
          aria-hidden
          className="mt-px size-3.5 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        {direct
          ? "Your details are only shared with this installer when you request a quote."
          : "Your details are only shared with the installers matched to your request."}
      </p>
    </aside>
  );
}
