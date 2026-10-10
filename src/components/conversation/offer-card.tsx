"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { type ConversationState, respondToOffer } from "@/actions/conversation";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/ui/form";
import type { ConversationOffer } from "@/lib/types";
import { cn } from "@/lib/utils";

const initialState: ConversationState = { ok: false };

const statusLabels: Record<ConversationOffer["status"], string> = {
  sent: "Awaiting your answer",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn by the installer",
};

const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });

/** A priced quote in the thread, with accept / decline while it is open. */
export function OfferCard({
  offer,
  token,
}: {
  offer: ConversationOffer;
  token: string;
}) {
  const [state, action] = useActionState(respondToOffer, initialState);
  const router = useRouter();
  useEffect(() => {
    if (state.sentAt) router.refresh();
  }, [state.sentAt, router]);

  const open = offer.status === "sent" && !state.ok;
  return (
    <article
      aria-label={`Quote ${offer.reference}`}
      className="rounded-xl border border-[#e3efec] bg-mint-soft p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-forest uppercase">
          <FileText aria-hidden className="size-4" strokeWidth={1.75} />
          Quote {offer.reference}
        </p>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            offer.status === "accepted"
              ? "bg-primary text-white"
              : offer.status === "sent"
                ? "bg-white text-ink"
                : "bg-white text-subtle",
          )}
        >
          {statusLabels[offer.status]}
        </span>
      </div>
      <p className="mt-3 text-[28px] font-extrabold leading-none text-ink">
        {money.format(Number(offer.amount))}{" "}
        <span className="text-sm font-normal text-subtle">
          {offer.includes_vat ? "including VAT" : "excluding VAT"}
        </span>
      </p>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">
        {offer.description}
      </p>
      {offer.valid_until ? (
        <p className="mt-2 text-xs text-subtle">
          Valid until {date.format(new Date(offer.valid_until))}
        </p>
      ) : null}
      {offer.response_note ? (
        <p className="mt-3 rounded-lg bg-white px-4 py-3 text-sm">
          Your note: {offer.response_note}
        </p>
      ) : null}

      {state.message ? (
        <div className="mt-4">
          <FormMessage tone={state.ok ? "success" : "error"}>
            {state.message}
          </FormMessage>
        </div>
      ) : null}

      {open ? (
        <form action={action} className="mt-5 space-y-3">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="offer_id" value={offer.id} />
          <label
            htmlFor={`note-${offer.id}`}
            className="text-sm font-medium text-ink"
          >
            Add a note (optional)
          </label>
          <textarea
            id={`note-${offer.id}`}
            name="note"
            rows={2}
            maxLength={2000}
            className="block w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          {state.fieldErrors?.note ? (
            <p role="alert" className="text-xs text-red-600">
              {state.fieldErrors.note}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <SubmitButton name="decision" value="accept" arrow>
              Accept quote
            </SubmitButton>
            <SubmitButton name="decision" value="decline" variant="outline">
              Decline
            </SubmitButton>
          </div>
          <p className="text-xs text-subtle">
            Accepting tells the installer you'd like to go ahead. Arrange the
            survey and payment directly with them.
          </p>
        </form>
      ) : null}
    </article>
  );
}
