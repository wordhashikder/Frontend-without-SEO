"use server";

import { z } from "zod";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";

const fields = [
  "rating",
  "title",
  "body",
  "author_name",
  "author_location",
] as const;

export type ReviewField = (typeof fields)[number];

export type ReviewFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<ReviewField, string>>;
  /** What was submitted, so the form can be shown again without JavaScript. */
  values?: Record<ReviewField, string>;
};

const reviewSchema = z.object({
  token: z.string().min(1).max(4000),
  rating: z.coerce
    .number({ error: "Choose a star rating." })
    .int({ error: "Choose a star rating." })
    .min(1, { error: "Choose a star rating." })
    .max(5, { error: "Choose a star rating." }),
  title: z
    .string()
    .trim()
    .min(3, {
      error: "Give your review a short title (at least 3 characters).",
    })
    .max(80, { error: "Please keep the title to 80 characters or fewer." }),
  body: z
    .string()
    .trim()
    .min(20, {
      error: "Please tell us a little more (at least 20 characters).",
    })
    .max(1500, {
      error: "Please keep your review to 1,500 characters or fewer.",
    }),
  author_name: z
    .string()
    .trim()
    .min(2, { error: "Enter your name as it should appear." })
    .max(60, { error: "Please keep your name to 60 characters or fewer." }),
  author_location: z
    .string()
    .trim()
    .max(60, { error: "Please keep this to 60 characters or fewer." })
    .transform((value) => value || null),
});

const TRY_AGAIN =
  "We couldn't save your review just now. Nothing has been lost, so please try again in a moment.";

const isField = (key: string): key is ReviewField =>
  (fields as readonly string[]).includes(key);

/** Form values as strings; textarea line breaks are normalised to "\n". */
const read = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.replace(/\r\n/g, "\n") : "";
};

/** Submits a customer review from an emailed invitation link. */
export async function submitReview(
  _previous: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const values = {
    rating: read(formData, "rating"),
    title: read(formData, "title"),
    body: read(formData, "body"),
    author_name: read(formData, "author_name"),
    author_location: read(formData, "author_location"),
  };

  const parsed = reviewSchema.safeParse({
    ...values,
    token: read(formData, "token"),
  });
  if (!parsed.success) {
    const fieldErrors: ReviewFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (isField(key) && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return Object.keys(fieldErrors).length > 0
      ? {
          ok: false,
          message: "Please check the highlighted fields.",
          fieldErrors,
          values,
        }
      : {
          ok: false,
          message:
            "This review link is not valid. Please open the link from your email again.",
          values,
        };
  }

  try {
    await api.createReview(parsed.data, await getClientIp());
    return { ok: true };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("[review] submit failed unexpectedly", error);
      return { ok: false, message: TRY_AGAIN, values };
    }
    if (error.status === 404 || error.code === "invalid_token") {
      return {
        ok: false,
        message:
          "This review link has expired or has already been used, so we couldn't save your review.",
        values,
      };
    }
    if (error.status === 429) {
      return {
        ok: false,
        message:
          "You've tried a few times in a short period. Please wait a few minutes and try again.",
        values,
      };
    }
    if (error.status === 400 || error.status === 422) {
      const fieldErrors: ReviewFormState["fieldErrors"] = {};
      for (const [key, message] of Object.entries(error.fields ?? {})) {
        if (isField(key)) fieldErrors[key] = message;
      }
      return Object.keys(fieldErrors).length > 0
        ? {
            ok: false,
            message: "Please check the highlighted fields.",
            fieldErrors,
            values,
          }
        : { ok: false, message: error.message, values };
    }
    return { ok: false, message: TRY_AGAIN, values };
  }
}
