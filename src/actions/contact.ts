"use server";

import { z } from "zod";
import { contactSubjects } from "@/components/contact/contact-subjects";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";

const fields = ["name", "email", "subject", "message"] as const;

export type ContactField = (typeof fields)[number];

export type ContactState = {
  ok: boolean;
  /** Form-level confirmation or error. */
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /** What was submitted, so the form can be refilled after an error. */
  values?: Partial<Record<ContactField, string>>;
};

const schema = z.object({
  name: z
    .string()
    .min(2, "Enter your name.")
    .max(100, "Your name must be 100 characters or fewer."),
  email: z
    .email("Enter an email address in the format name@example.com.")
    .max(254, "Your email address must be 254 characters or fewer."),
  subject: z.enum(
    contactSubjects.map((subject) => subject.value),
    "Select a topic.",
  ),
  message: z
    .string()
    .min(10, "Enter a message of at least 10 characters.")
    .max(5000, "Your message must be 5,000 characters or fewer."),
});

const isContactField = (key: string): key is ContactField =>
  (fields as readonly string[]).includes(key);

/** Contact form submission. Works as a plain form post when JavaScript is off. */
export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const values = {
    name: text("name"),
    email: text("email"),
    subject: text("subject"),
    message: text("message"),
  };

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
    await api.sendContactMessage(
      { ...parsed.data, ...(website ? { website } : {}) },
      await getClientIp(),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const fieldErrors = Object.fromEntries(
        Object.entries(error.fields ?? {}).filter(([key]) =>
          isContactField(key),
        ),
      );
      return { ok: false, message: error.message, fieldErrors, values };
    }
    console.error("[contact] unexpected error", error);
    return {
      ok: false,
      message:
        "Something went wrong and your message was not sent. Please try again.",
      values,
    };
  }

  return {
    ok: true,
    message:
      "Thanks for getting in touch. We aim to reply within 1 working day.",
  };
}
