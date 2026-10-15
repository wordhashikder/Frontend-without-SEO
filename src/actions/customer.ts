"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, api } from "@/lib/api";
import { clearCustomerSession, getCustomerToken } from "@/lib/customer-session";
import { getClientIp } from "@/lib/request";

/*
 * Server Actions for the homeowner's quote dashboard (/uk/my-quotes/). Each
 * one reads the session cookie itself and the API checks it again: nothing is
 * trusted from the browser except the form fields.
 */

export type CustomerActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Bumped on every success, so a form can reset itself. */
  sentAt?: number;
};

const UNAVAILABLE =
  "We couldn't reach the service. Please try again in a moment.";
const SIGNED_OUT = "Your session has ended. Please request a new link.";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "Enter a valid email address.")
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));
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

function failure(error: unknown): CustomerActionState {
  if (error instanceof ApiError) {
    if (error.status === 401) return { ok: false, message: SIGNED_OUT };
    if (error.status === 429) {
      return {
        ok: false,
        message: "Too many attempts. Please wait a few minutes and try again.",
      };
    }
    if (error.status >= 500) return { ok: false, message: UNAVAILABLE };
    return { ok: false, message: error.message };
  }
  console.error("[customer] unexpected error", error);
  return { ok: false, message: "Something went wrong. Please try again." };
}

/** "Email me a new link". The answer never says whether the address is known. */
export async function requestMagicLink(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const parsed = email.safeParse(field(formData, "email"));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { email: parsed.error.issues[0]?.message ?? "" },
    };
  }
  try {
    await api.customerRequestLink(parsed.data, await getClientIp());
  } catch (error) {
    return failure(error);
  }
  return {
    ok: true,
    message:
      "If we have quotes for that address, a secure link is on its way. It can take a minute to arrive.",
    sentAt: Date.now(),
  };
}

export async function sendCustomerMessage(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, message: SIGNED_OUT };
  const conversationId = field(formData, "conversation_id");
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) {
    return { ok: false, message: "That conversation could not be found." };
  }
  const parsed = body.safeParse(field(formData, "body"));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { body: parsed.error.issues[0]?.message ?? "" },
    };
  }
  try {
    await api.customerSendMessage(token, conversationId, parsed.data);
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/uk/my-quotes", "layout");
  return { ok: true, message: "Message sent.", sentAt: Date.now() };
}

export async function respondToCustomerQuote(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, message: SIGNED_OUT };
  const offerId = field(formData, "offer_id");
  const decision = field(formData, "decision");
  if (
    !/^[0-9a-f-]{36}$/i.test(offerId) ||
    (decision !== "accept" && decision !== "decline")
  ) {
    return { ok: false, message: "That quote could not be found." };
  }
  const parsedNote = note.safeParse(field(formData, "note"));
  if (!parsedNote.success) {
    return {
      ok: false,
      fieldErrors: { note: parsedNote.error.issues[0]?.message ?? "" },
    };
  }
  try {
    await api.customerRespond(
      token,
      offerId,
      decision,
      parsedNote.data || null,
    );
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/uk/my-quotes", "layout");
  return {
    ok: true,
    message:
      decision === "accept"
        ? "Quote accepted. The installer has been told and will be in touch."
        : "Quote declined. The installer has been told.",
    sentAt: Date.now(),
  };
}

const details = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(60, "Use no more than 60 characters."),
  phone: z
    .string()
    .trim()
    .max(30, "Use no more than 30 characters.")
    .refine(
      (value) => value === "" || /^\+?[\d\s()-]+$/.test(value),
      "Enter a phone number, like 07700 900123.",
    ),
});

export async function updateCustomerDetails(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, message: SIGNED_OUT };
  const parsed = details.safeParse({
    first_name: field(formData, "first_name"),
    phone: field(formData, "phone"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { ok: false, fieldErrors };
  }
  try {
    await api.customerUpdate(token, {
      first_name: parsed.data.first_name,
      phone: parsed.data.phone || null,
    });
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/uk/my-quotes", "layout");
  return { ok: true, message: "Your details are saved.", sentAt: Date.now() };
}

export async function signOutCustomer() {
  const token = await getCustomerToken();
  if (token) {
    try {
      await api.customerLogout(token);
    } catch {
      // The cookie is removed regardless; the server session also expires.
    }
  }
  await clearCustomerSession();
  redirect("/uk/my-quotes/");
}

export async function eraseCustomerData() {
  const token = await getCustomerToken();
  if (token) {
    try {
      await api.customerErase(token);
    } catch (error) {
      console.error("[customer] erase failed", error);
      return;
    }
  }
  await clearCustomerSession();
  redirect("/");
}
