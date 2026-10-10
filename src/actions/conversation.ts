"use server";

import { z } from "zod";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";

/*
 * The homeowner's private conversation page (/messages/?token=…): reply to the
 * installer, and accept or decline a quote. The token from the emailed link
 * travels in a hidden field and is checked by the API on every request.
 */

export type ConversationState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Bumped on every success, so the form can reset itself. */
  sentAt?: number;
};

const token = z.string().trim().min(1).max(2048);
const body = z
  .string()
  .trim()
  .min(1, "Write a message first.")
  .max(5000, "Keep your message under 5,000 characters.");
const note = z
  .string()
  .trim()
  .max(2000, "Keep your note under 2,000 characters.");

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function failure(error: unknown): ConversationState {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return {
        ok: false,
        message: "Too many messages. Please wait a few minutes and try again.",
      };
    }
    if (error.status >= 500) {
      return {
        ok: false,
        message: "We couldn't reach the service. Please try again in a moment.",
      };
    }
    return { ok: false, message: error.message };
  }
  console.error("[conversation] unexpected error", error);
  return { ok: false, message: "Something went wrong. Please try again." };
}

export async function replyToConversation(
  _previous: ConversationState,
  formData: FormData,
): Promise<ConversationState> {
  const parsedToken = token.safeParse(field(formData, "token"));
  if (!parsedToken.success) {
    return { ok: false, message: "This link is invalid or has expired." };
  }
  const parsed = body.safeParse(field(formData, "body"));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { body: parsed.error.issues[0]?.message ?? "" },
    };
  }
  try {
    await api.replyToConversation(
      parsedToken.data,
      parsed.data,
      await getClientIp(),
    );
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Message sent.", sentAt: Date.now() };
}

export async function respondToOffer(
  _previous: ConversationState,
  formData: FormData,
): Promise<ConversationState> {
  const parsedToken = token.safeParse(field(formData, "token"));
  const offerId = field(formData, "offer_id");
  const decision = field(formData, "decision");
  if (
    !parsedToken.success ||
    !/^[0-9a-f-]{36}$/i.test(offerId) ||
    (decision !== "accept" && decision !== "decline")
  ) {
    return { ok: false, message: "This link is invalid or has expired." };
  }
  const parsedNote = note.safeParse(field(formData, "note"));
  if (!parsedNote.success) {
    return {
      ok: false,
      fieldErrors: { note: parsedNote.error.issues[0]?.message ?? "" },
    };
  }
  try {
    await api.respondToOffer(
      parsedToken.data,
      offerId,
      decision,
      parsedNote.data || null,
      await getClientIp(),
    );
  } catch (error) {
    return failure(error);
  }
  return {
    ok: true,
    message:
      decision === "accept"
        ? "Quote accepted. The installer has been told and will be in touch."
        : "Quote declined. The installer has been told.",
    sentAt: Date.now(),
  };
}
