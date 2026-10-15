import Link from "next/link";
import { QuoteCard } from "@/components/customer/quote-card";
import { RequestSwitcher } from "@/components/customer/request-switcher";
import { getSelectedRequest } from "@/lib/customer-data";
import { routes } from "@/lib/site";

export default async function QuotesPage({
  searchParams,
}: PageProps<"/uk/my-quotes/quotes">) {
  const { r } = await searchParams;
  const selected = await getSelectedRequest(Array.isArray(r) ? r[0] : r);
  if (!selected) return null;
  const { requests, detail } = selected;
  const quotes = detail?.quotes ?? [];

  return (
    <div className="space-y-6">
      {detail ? (
        <RequestSwitcher
          requests={requests}
          currentId={detail.id}
          basePath="/uk/my-quotes/quotes/"
        />
      ) : null}
      <header>
        <h1 className="text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">
          Your quotes
        </h1>
        <p className="mt-1.5 text-sm">
          {detail
            ? `${quotes.length} ${quotes.length === 1 ? "quote" : "quotes"} for ${detail.postcode}, up to ${detail.slots_total} installers can quote.`
            : "Quotes from installers will appear here."}
        </p>
      </header>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
          <p className="text-[15px] font-semibold text-ink">No quotes yet</p>
          <p className="mx-auto mt-2 max-w-[420px] text-sm">
            Installers usually reply within a day or two. We'll email you as
            soon as the first quote arrives.
          </p>
        </div>
      ) : (
        <ul className="space-y-5">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <QuoteCard quote={quote} />
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={routes.howItWorks}
          className="rounded-xl border border-line bg-white p-4 text-sm hover:border-ink/30"
        >
          <span className="block font-semibold text-ink">
            Not sure which quote to choose?
          </span>
          Read the guide
        </Link>
        <Link
          href="/uk/my-quotes/messages/"
          className="rounded-xl border border-line bg-white p-4 text-sm hover:border-ink/30"
        >
          <span className="block font-semibold text-ink">Have questions?</span>
          Open Messages
        </Link>
        <Link
          href="/uk/my-quotes/help/"
          className="rounded-xl border border-line bg-white p-4 text-sm hover:border-ink/30"
        >
          <span className="block font-semibold text-ink">Need help?</span>
          Contact support
        </Link>
      </div>
    </div>
  );
}
