"use server";

import { z } from "zod";
import { enquiryLimits, enquiryMessages } from "@/content/enquiry-form";
import { isPhone } from "@/content/quote-questions";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";

/*
 * The "Request a Quote" form on an installer's profile. The API emails the
 * request to the installer (Pro and Premium) or to the PickASparky team (Free
 * plan), and sends the customer a copy.
 */

const fields = ["name", "email", "phone", "message"] as const;

export type EnquiryField = (typeof fields)[number];

export type EnquiryState = {
  ok: boolean;
  /** Form-level confirmation or error. */
  message?: string;
  /** Set when the installer is no longer listed. */
  unavailable?: boolean;
  fieldErrors?: Partial<Record<EnquiryField, string>>;
  /** What was submitted, so the form can be refilled after an error. */
  values?: Partial<Record<EnquiryField, string>>;
};

const schema = z.object({
  name: z
    .string()
    .min(2, enquiryMessages.name)
    .max(enquiryLimits.name, enquiryMessages.nameLength),
  email: z
    .email(enquiryMessages.email)
    .max(enquiryLimits.email, enquiryMessages.email),
  // Optional, as on the quote form: blank is sent as null.
  phone: z
    .string()
    .max(enquiryLimits.phone, enquiryMessages.phone)
    .refine((value) => value === "" || isPhone(value), {
      error: enquiryMessages.phone,
    })
    .transform((value) => value || null),
  message: z
    .string()
    .min(10, enquiryMessages.message)
    .max(enquiryLimits.message, enquiryMessages.messageLength),
});

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isEnquiryField = (key: string): key is EnquiryField =>
  (fields as readonly string[]).includes(key);

/** Works as a plain form post before hydration or without JavaScript. */
export async function sendInstallerEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const installer = text("installer");
  const values = {
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    message: text("message"),
  };
  if (!SLUG.test(installer) || installer.length > 140) {
    return { ok: false, message: enquiryMessages.tryAgain, values };
  }

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    return {
      ok: false,
      message: "Please check the highlighted fields and try again.",
      fieldErrors: Object.fromEntries(
        fields.flatMap((field) => {
          const first = errors[field]?.[0];
          return first ? [[field, first]] : [];
        }),
      ),
      values,
    };
  }

  // The honeypot is forwarded when filled: the API drops those submissions.
  const website = text("website");

  try {
    await api.sendInstallerEnquiry(
      installer,
      { ...parsed.data, ...(website ? { website } : {}) },
      await getClientIp(),
    );
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("[enquiry] unexpected error", error);
      return { ok: false, message: enquiryMessages.tryAgain, values };
    }
    if (error.status === 429) {
      return {
        ok: false,
        message: enquiryMessages.tooMany,
        values,
      };
    }
    if (error.status === 404) {
      return {
        ok: false,
        unavailable: true,
        message: enquiryMessages.unavailable,
        values,
      };
    }
    const fieldErrors = Object.fromEntries(
      Object.entries(error.fields ?? {}).filter(([key]) => isEnquiryField(key)),
    );
    return {
      ok: false,
      message: error.status >= 500 ? enquiryMessages.tryAgain : error.message,
      fieldErrors,
      values,
    };
  }

  return { ok: true };
}
