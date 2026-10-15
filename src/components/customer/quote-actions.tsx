"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  type CustomerActionState,
  respondToCustomerQuote,
} from "@/actions/customer";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/ui/form";

const initialState: CustomerActionState = { ok: false };

/** Accept or decline an open quote (with an optional note to the installer). */
export function QuoteActions({ offerId }: { offerId: string }) {
  const [state, action] = useActionState(respondToCustomerQuote, initialState);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (state.sentAt) router.refresh();
  }, [state.sentAt, router]);

  if (state.ok) {
    return <FormMessage tone="success">{state.message}</FormMessage>;
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Accept or decline
      </button>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="offer_id" value={offerId} />
      <label
        htmlFor={`note-${offerId}`}
        className="text-sm font-medium text-ink"
      >
        Add a note (optional)
      </label>
      <textarea
        id={`note-${offerId}`}
        name="note"
        rows={2}
        maxLength={2000}
        className="block w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      {state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
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
        Accepting tells the installer you'd like to go ahead. Arrange the survey
        and payment directly with them.
      </p>
    </form>
  );
}
