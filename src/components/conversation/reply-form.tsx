"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import {
  type ConversationState,
  replyToConversation,
} from "@/actions/conversation";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/ui/form";

const initialState: ConversationState = { ok: false };

/** The homeowner's reply box; refreshes the thread after sending. */
export function ReplyForm({
  token,
  installerName,
}: {
  token: string;
  installerName: string;
}) {
  const [state, action] = useActionState(replyToConversation, initialState);
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.sentAt) {
      form.current?.reset();
      router.refresh();
    }
  }, [state.sentAt, router]);

  const error = state.fieldErrors?.body;
  return (
    <form ref={form} action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <label htmlFor="reply-body" className="text-sm font-semibold text-ink">
        Reply to {installerName}
      </label>
      <textarea
        id="reply-body"
        name="body"
        required
        rows={4}
        maxLength={5000}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "reply-body-error" : undefined}
        placeholder="Ask a question or suggest a time for a survey…"
        className="block w-full rounded-lg border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-shadow placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      {error ? (
        <p id="reply-body-error" role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
      {state.message && !state.ok ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      {state.ok ? (
        <FormMessage tone="success">{state.message}</FormMessage>
      ) : null}
      <SubmitButton arrow pendingLabel="Sending…">
        Send message
      </SubmitButton>
    </form>
  );
}
