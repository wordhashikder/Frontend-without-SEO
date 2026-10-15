import {
  BadgeCheck,
  CalendarClock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { InstallerLogo } from "@/components/sections/installer-card";
import { StarRating } from "@/components/ui/star-rating";
import { installerPath } from "@/lib/site";
import type { CustomerQuote } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate, gbp } from "./format";
import { QuoteActions } from "./quote-actions";

const statusText: Record<CustomerQuote["status"], string> = {
  sent: "Awaiting your answer",
  accepted: "You accepted this quote",
  declined: "You declined this quote",
  withdrawn: "Withdrawn by the installer",
};

/** One installer's quote: who they are, the price and what it covers. */
export function QuoteCard({ quote }: { quote: CustomerQuote }) {
  const { installer } = quote;
  const open = quote.status === "sent";
  return (
    <article
      aria-label={`Quote from ${installer.business_name}`}
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-soft sm:p-6",
        quote.highlight === "lowest" && open
          ? "border-primary ring-2 ring-primary/15"
          : "border-line",
        quote.status === "declined" && "opacity-75",
      )}
    >
      {quote.highlight === "lowest" && open ? (
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          <BadgeCheck aria-hidden className="size-3.5" />
          Lowest price
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex items-start gap-4">
          <InstallerLogo
            name={installer.business_name}
            logoUrl={installer.logo_url}
            size={64}
          />
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold text-ink">
              {installer.business_name}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px]">
              {installer.rating_avg !== null && installer.review_count > 0 ? (
                <>
                  <StarRating rating={installer.rating_avg} size="sm" />
                  <span className="font-semibold text-ink">
                    {installer.rating_avg.toFixed(1)}
                  </span>
                  <span className="text-subtle">
                    ({installer.review_count} reviews)
                  </span>
                </>
              ) : (
                <span className="text-subtle">No reviews yet</span>
              )}
              <span className="text-subtle">· {installer.town}</span>
            </p>
            {installer.accreditations.length > 0 ? (
              <ul
                className="mt-2 flex flex-wrap gap-1.5"
                aria-label="Accreditations"
              >
                {installer.accreditations.map((name) => (
                  <li
                    key={name}
                    className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-[11px] font-medium text-ink/80"
                  >
                    <ShieldCheck aria-hidden className="size-3 text-primary" />
                    {name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="md:text-right">
          <p className="text-[30px] leading-none font-extrabold text-ink">
            {gbp(quote.amount)}
          </p>
          <p className="mt-1 text-xs text-subtle">
            {quote.includes_vat ? "including VAT" : "excluding VAT"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-mint-soft px-4 py-3.5">
        <p className="text-xs font-semibold tracking-wide text-forest uppercase">
          What's included
        </p>
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">
          {quote.description}
        </p>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle">
        <span>Quote {quote.reference}</span>
        <span>Received {formatDate(quote.created_at)}</span>
        {quote.valid_until ? (
          <span className="inline-flex items-center gap-1">
            <CalendarClock aria-hidden className="size-3.5" />
            Valid until {formatDate(quote.valid_until)}
          </span>
        ) : null}
        <span className="font-medium text-ink">{statusText[quote.status]}</span>
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        {open ? <QuoteActions offerId={quote.id} /> : null}
        <Link
          href={`/uk/my-quotes/messages/?c=${quote.conversation_id}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-sm font-semibold text-ink hover:border-ink/30"
        >
          <MessageSquare aria-hidden className="size-4" />
          View Message &amp; Reply
        </Link>
        <Link
          href={installerPath(installer.slug)}
          className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
