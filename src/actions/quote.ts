"use server";

import { z } from "zod";
import {
  isFollowupAllowed,
  isPhone,
  isQuoteField,
  type QuoteFieldErrors,
  quoteEnums,
  quoteLimits,
  quoteMessages,
} from "@/content/quote-questions";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";
import type { QuoteRequestCreate } from "@/lib/types";
import { formatPostcode, isUkPostcode } from "@/lib/utils";

// ---- Postcode check ----------------------------------------------------------

export type PostcodeCheck =
  | {
      ok: true;
      postcode: string;
      district: string | null;
      /** `null` when the lookup could not be completed. */
      installersInRange: number | null;
      /** False when the lookup service was unavailable and we let the customer continue. */
      verified: boolean;
    }
  | { ok: false; message: string };

/** A slow lookup must not stall the first step of the funnel. */
const POSTCODE_LOOKUP_TIMEOUT_MS = 4_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new ApiError(503, "lookup_timeout", "Lookup timed out")),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Validates a postcode before the questionnaire starts.
 *
 * Only a definite "no such postcode" stops the customer. If the API or the
 * geocoder is down, rate limited or slow, they carry on: the API accepts the
 * request anyway and geocodes it later.
 */
export async function checkPostcode(input: string): Promise<PostcodeCheck> {
  const value = typeof input === "string" ? input.trim() : "";
  if (!value) return { ok: false, message: quoteMessages.postcodeRequired };
  if (value.length > 10 || !isUkPostcode(value)) {
    return { ok: false, message: quoteMessages.postcodeFormat };
  }

  const postcode = formatPostcode(value);
  try {
    const result = await withTimeout(
      api.lookupPostcode(postcode, await getClientIp()),
      POSTCODE_LOOKUP_TIMEOUT_MS,
    );
    return {
      ok: true,
      postcode: formatPostcode(result.postcode || postcode),
      district: result.district,
      installersInRange: result.installers_in_range,
      verified: true,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return { ok: false, message: quoteMessages.postcodeNotFound };
      }
      if (error.status === 422) {
        return { ok: false, message: quoteMessages.postcodeFormat };
      }
      console.error(`[quote] postcode lookup skipped: ${error.code}`);
    } else {
      console.error("[quote] postcode lookup failed unexpectedly", error);
    }
    return {
      ok: true,
      postcode,
      district: null,
      installersInRange: null,
      verified: false,
    };
  }
}

// ---- Submit ------------------------------------------------------------------

export type QuoteSubmitResult =
  | {
      ok: true;
      reference: string;
      postcode: string;
      matchedInstallers: number;
    }
  | { ok: false; message: string; fieldErrors?: QuoteFieldErrors };

const choice = <T extends string>(options: [T, ...T[]]) =>
  z.enum(options, { error: quoteMessages.choose });

/** Optional free text: trimmed, length-limited, empty becomes null. */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, { error: message })
    .nullish()
    .transform((value) => value || null);

const quoteSchema = z
  .object({
    postcode: z
      .string({ error: quoteMessages.postcodeRequired })
      .trim()
      .min(1, { error: quoteMessages.postcodeRequired })
      .max(10, { error: quoteMessages.postcodeFormat })
      .refine(isUkPostcode, { error: quoteMessages.postcodeFormat })
      .transform(formatPostcode),
    installation_type: choice(quoteEnums.installation_type),
    charger_location: choice(quoteEnums.charger_location),
    existing_charger: choice(quoteEnums.existing_charger),
    charger_followup: choice(quoteEnums.charger_followup),
    fuse_box_distance: choice(quoteEnums.fuse_box_distance),
    vehicle: optionalText(quoteLimits.vehicle, quoteMessages.vehicleLength),
    vehicle_undecided: z.boolean().nullish().transform(Boolean),
    timing: choice(quoteEnums.timing),
    notes: optionalText(quoteLimits.notes, quoteMessages.notesLength),
    first_name: z
      .string({ error: quoteMessages.firstName })
      .trim()
      .min(1, { error: quoteMessages.firstName })
      .max(quoteLimits.firstName, { error: quoteMessages.firstNameLength }),
    email: z
      .string({ error: quoteMessages.email })
      .trim()
      .max(quoteLimits.email, { error: quoteMessages.email })
      .pipe(z.email({ error: quoteMessages.email })),
    // Optional: blank (or missing) is sent as null; a number that is given must be valid.
    phone: z
      .string({ error: quoteMessages.phone })
      .trim()
      .max(30, { error: quoteMessages.phone })
      .refine((value) => value === "" || isPhone(value), {
        error: quoteMessages.phone,
      })
      .nullish()
      .transform((value) => value || null),
    consent: z.literal(true, { error: quoteMessages.consent }),
    // A malformed slug is dropped rather than blocking the request.
    installer_slug: z
      .string()
      .trim()
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .nullish()
      .catch(null),
    website: z.string().max(500).nullish().catch(null),
  })
  .superRefine((data, context) => {
    // Question 3 branches: the follow-up must belong to the branch that was shown.
    if (!isFollowupAllowed(data.existing_charger, data.charger_followup)) {
      context.addIssue({
        code: "custom",
        path: ["charger_followup"],
        message: quoteMessages.choose,
      });
    }
  });

const CHECK_ANSWERS = "Please check the highlighted answers and try again.";
const TRY_AGAIN =
  "We couldn't send your request just now. Your answers are saved, so please try again in a moment.";

/** Keeps only errors for fields the questionnaire knows how to show. */
function knownFieldErrors(
  entries: Iterable<readonly [string, string]>,
): QuoteFieldErrors {
  const errors: QuoteFieldErrors = {};
  for (const [key, message] of entries) {
    if (isQuoteField(key) && !errors[key]) errors[key] = message;
  }
  return errors;
}

/**
 * Creates the quote request. Everything from the browser is re-validated here
 * (including the Question 3 branch combination) before it reaches the API.
 */
export async function submitQuote(input: unknown): Promise<QuoteSubmitResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = knownFieldErrors(
      parsed.error.issues.map(
        (issue) => [String(issue.path[0] ?? ""), issue.message] as const,
      ),
    );
    return Object.keys(fieldErrors).length > 0
      ? { ok: false, message: CHECK_ANSWERS, fieldErrors }
      : { ok: false, message: TRY_AGAIN };
  }

  const { installer_slug, website, ...answers } = parsed.data;
  const body: QuoteRequestCreate = {
    ...answers,
    vehicle: answers.vehicle_undecided ? null : answers.vehicle,
    ...(installer_slug ? { installer_slug } : {}),
    // Honeypot: passed through so the API can silently drop bot submissions.
    ...(website ? { website } : {}),
  };

  try {
    const created = await api.createQuote(body, await getClientIp());
    return {
      ok: true,
      reference: String(created.reference),
      postcode: String(created.postcode ?? body.postcode),
      matchedInstallers: Math.max(0, Number(created.matched_installers) || 0),
    };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("[quote] submit failed unexpectedly", error);
      return { ok: false, message: TRY_AGAIN };
    }
    if (error.status === 429) {
      return {
        ok: false,
        message:
          "You've sent several requests in a short time. Please wait a few minutes and try again.",
      };
    }
    if (error.status === 400 || error.status === 422) {
      const fieldErrors = knownFieldErrors(Object.entries(error.fields ?? {}));
      return Object.keys(fieldErrors).length > 0
        ? { ok: false, message: CHECK_ANSWERS, fieldErrors }
        : { ok: false, message: error.message };
    }
    return { ok: false, message: TRY_AGAIN };
  }
}
