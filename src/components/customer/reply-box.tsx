"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import {
  type CustomerActionState,
  sendCustomerMessage,
} from "@/actions/customer";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/ui/form";

const initialState: CustomerActionState = { ok: false };

export function ReplyBox({
  conversationId,
  installerName,
}: {
  conversationId: string;
  installerName: string;
}) {
  const [state, action] = useActionState(sendCustomerMessage, initialState);
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
    <form
      ref={form}
      action={action}
      className="space-y-3 border-t border-line p-4 sm:p-5"
    >
      <input type="hidden" name="conversation_id" value={conversationId} />
      <label htmlFor="customer-reply" className="sr-only">
        Reply to {installerName}
      </label>
      <textarea
        id="customer-reply"
        name="body"
        required
        rows={3}
        maxLength={5000}
        aria-invalid={error ? true : undefined}
        placeholder={`Reply to ${installerName}…`}
        className="block w-full rounded-lg border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      {error ? (
        <p role="alert" className="text-xs text-red-600">
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
