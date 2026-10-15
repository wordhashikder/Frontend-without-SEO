import { FileText } from "lucide-react";
import Link from "next/link";
import { installerPath } from "@/lib/site";
import type {
  ConversationMessage,
  ConversationOffer,
  ConversationThread,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime, gbp } from "./format";
import { QuoteActions } from "./quote-actions";
import { ReplyBox } from "./reply-box";

type Entry =
  | { kind: "message"; at: string; item: ConversationMessage }
  | { kind: "offer"; at: string; item: ConversationOffer };

const offerStatus: Record<ConversationOffer["status"], string> = {
  sent: "Awaiting your answer",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn by the installer",
};

export function Thread({ thread }: { thread: ConversationThread }) {
  const entries: Entry[] = [
    ...thread.messages.map(
      (item): Entry => ({ kind: "message", at: item.created_at, item }),
    ),
    ...thread.offers.map(
      (item): Entry => ({ kind: "offer", at: item.created_at, item }),
    ),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div className="flex min-h-[420px] flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-bold text-ink">
            {thread.installer_name}
          </h2>
          <p className="text-xs text-subtle">
            {thread.job.reference
              ? `Request ${thread.job.reference}`
              : "Your enquiry"}
          </p>
        </div>
        <Link
          href={installerPath(thread.installer_slug)}
          className="shrink-0 text-xs font-semibold text-primary hover:text-primary-dark"
        >
          View profile
        </Link>
      </header>
      <ol
        className="flex-1 space-y-4 p-4 sm:p-5"
        aria-label="Messages and quotes"
      >
        {entries.length === 0 ? (
          <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm">
            No messages yet. Say hello below.
          </li>
        ) : null}
        {entries.map((entry) => (
          <li key={`${entry.kind}-${entry.item.id}`}>
            {entry.kind === "offer" ? (
              <OfferBubble offer={entry.item} />
            ) : (
              <Bubble
                message={entry.item}
                installerName={thread.installer_name}
              />
            )}
          </li>
        ))}
      </ol>
      <ReplyBox
        conversationId={thread.id}
        installerName={thread.installer_name}
      />
    </div>
  );
}

function Bubble({
  message,
  installerName,
}: {
  message: ConversationMessage;
  installerName: string;
}) {
  if (message.sender === "system") {
    return (
      <p className="mx-auto max-w-[520px] whitespace-pre-line rounded-full bg-surface px-4 py-2 text-center text-xs text-subtle">
        {message.body}
      </p>
    );
  }
  const mine = message.sender === "homeowner";
  const author = mine
    ? "You"
    : message.sender === "team"
      ? "PickASparky team"
      : installerName;
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3",
          mine
            ? "rounded-br-sm bg-primary text-white"
            : "rounded-bl-sm border border-line bg-white text-ink shadow-soft",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold",
            mine ? "text-white/85" : "text-subtle",
          )}
        >
          {author} · {formatDateTime(message.created_at)}
        </p>
        <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">
          {message.body}
        </p>
      </div>
    </div>
  );
}

function OfferBubble({ offer }: { offer: ConversationOffer }) {
  return (
    <article
      aria-label={`Quote ${offer.reference}`}
      className="rounded-xl border border-[#e3efec] bg-mint-soft p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-forest uppercase">
          <FileText aria-hidden className="size-4" strokeWidth={1.75} />
          Quote {offer.reference}
        </p>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink">
          {offerStatus[offer.status]}
        </span>
      </div>
      <p className="mt-3 text-[26px] leading-none font-extrabold text-ink">
        {gbp(offer.amount)}{" "}
        <span className="text-sm font-normal text-subtle">
          {offer.includes_vat ? "including VAT" : "excluding VAT"}
        </span>
      </p>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">
        {offer.description}
      </p>
      {offer.valid_until ? (
        <p className="mt-2 text-xs text-subtle">
          Valid until {formatDate(offer.valid_until)}
        </p>
      ) : null}
      {offer.status === "sent" ? (
        <div className="mt-4">
          <QuoteActions offerId={offer.id} />
        </div>
      ) : null}
    </article>
  );
}
