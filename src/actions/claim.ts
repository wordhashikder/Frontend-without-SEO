"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/components/auth/password-policy";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";
import { routes } from "@/lib/site";

/*
 * Claiming a free listing PickASparky added for a business:
 * 1. "Is this your business?" on the profile asks for the business email; the
 *    API emails a claim link when it matches the one on file (otherwise the
 *    team checks the request by hand). The answer never says which happened.
 * 2. The link opens /installer/claim/, where the business sets a password.
 */

export type ClaimState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  code?: "invalid_token" | "already_claimed" | "email_in_use";
  values?: Record<string, string>;
};

const UNAVAILABLE =
  "We couldn't reach the service. Please try again in a moment.";
const RATE_LIMITED =
  "Too many attempts. Please wait a few minutes and try again.";

const email = z
  .string()
  .trim()
  .min(1, "Enter your business email address.")
  .max(254, "Enter a valid email address.")
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(
    PASSWORD_MAX_LENGTH,
    `Use no more than ${PASSWORD_MAX_LENGTH} characters.`,
  )
  .regex(/\p{L}/u, "Include at least one letter.")
  .regex(/\p{Nd}/u, "Include at least one number.");

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function failure(error: unknown, values?: Record<string, string>): ClaimState {
  if (error instanceof ApiError) {
    if (error.status === 429)
      return { ok: false, message: RATE_LIMITED, values };
    if (error.status >= 500) return { ok: false, message: UNAVAILABLE, values };
    return { ok: false, message: error.message, values };
  }
  console.error("[claim] unexpected error", error);
  return { ok: false, message: "Something went wrong. Please try again." };
}

/** Step 1: ask for a claim link from the installer's profile page. */
export async function requestClaim(
  _previous: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const slug = field(formData, "slug");
  const raw = field(formData, "email");
  const parsed = email.safeParse(raw);
  if (!slug || !parsed.success) {
    return {
      ok: false,
      fieldErrors: {
        email: parsed.error?.issues[0]?.message ?? "Enter a valid email.",
      },
      values: { email: raw },
    };
  }
  try {
    const response = await api.requestClaim(
      slug,
      parsed.data,
      await getClientIp(),
    );
    return { ok: true, message: response.message };
  } catch (error) {
    return failure(error, { email: raw });
  }
}

/** Step 2: set a password with the emailed link and take over the listing. */
export async function claimListing(
  _previous: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const token = field(formData, "token").trim();
  if (!token || token.length > 2048) {
    return {
      ok: false,
      code: "invalid_token",
      message: "This link is invalid or has expired.",
    };
  }
  if (formData.get("accept_terms") !== "on") {
    return {
      ok: false,
      fieldErrors: { accept_terms: "Please accept the terms to continue." },
    };
  }
  const parsed = password.safeParse(field(formData, "password"));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: {
        password: parsed.error.issues[0]?.message ?? "Choose a password.",
      },
    };
  }

  try {
    await api.claimListing(token, parsed.data, await getClientIp());
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === "invalid_token") {
        return { ok: false, code: "invalid_token", message: error.message };
      }
      if (error.code === "listing_already_claimed") {
        return { ok: false, code: "already_claimed", message: error.message };
      }
      if (error.code === "email_in_use") {
        return { ok: false, code: "email_in_use", message: error.message };
      }
      if (error.status === 422 && error.fields?.password) {
        return { ok: false, fieldErrors: { password: error.fields.password } };
      }
    }
    return failure(error);
  }
  redirect(`${routes.login}?claimed=1`);
}
