"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/components/auth/password-policy";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";
import { clearSession, getRefreshToken, setSession } from "@/lib/session";
import { safeNextPath } from "@/lib/session-cookies";
import { routes, site } from "@/lib/site";
import type { TokenPair } from "@/lib/types";
import { formatPostcode, isUkPostcode } from "@/lib/utils";

/**
 * Result of an auth form submission, consumed by `useActionState`.
 * Only display text and non-secret field values cross to the browser:
 * passwords and tokens are never echoed back.
 */
export type AuthState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** A reason the form reacts to, beyond showing the message. */
  code?: "email_not_verified" | "invalid_token" | "rate_limited";
  /** What the visitor typed (never the password), to refill the form. */
  values?: Record<string, string>;
};

const UNAVAILABLE =
  "We couldn't reach the service. Please try again in a moment.";
const RATE_LIMITED =
  "Too many attempts. Please wait a few minutes and try again.";
const CHECK_FIELDS = "Please check the highlighted fields and try again.";
const UNEXPECTED = "Something went wrong. Please try again.";

// ---- Validation ------------------------------------------------------------

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "Enter a valid email address.")
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

/** The API's policy: 10 to 128 characters, at least one letter and one digit. */
const newPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(
    PASSWORD_MAX_LENGTH,
    `Use no more than ${PASSWORD_MAX_LENGTH} characters.`,
  )
  .regex(/\p{L}/u, "Include at least one letter.")
  .regex(/\p{Nd}/u, "Include at least one number.");

const token = z.string().trim().min(1).max(2048);

const registerSchema = z.object({
  business_name: z
    .string()
    .trim()
    .min(2, "Enter your business name.")
    .max(120, "Use no more than 120 characters."),
  contact_name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Use no more than 80 characters."),
  email,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]+$/, "Enter a phone number, like 07700 900123.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 10 && digits <= 15;
    }, "Enter a phone number, like 07700 900123."),
  postcode: z
    .string()
    .trim()
    .refine(isUkPostcode, "Enter a full UK postcode, like M1 1AA.")
    .transform(formatPostcode),
  password: newPassword,
  plan: z.enum(["free", "pro", "premium"], "Choose a plan."),
  accept_terms: z.literal(
    "on",
    "You need to agree to the terms to create an account.",
  ),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(1024),
});

// ---- Helpers ---------------------------------------------------------------

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** First message per field, in the `{ field: message }` shape the forms use. */
function fieldErrorsOf(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Turn an API failure into something a person can act on. */
function failure(
  error: unknown,
  options: { values?: Record<string, string>; fields?: string[] } = {},
): AuthState {
  const { values, fields = [] } = options;
  if (!(error instanceof ApiError)) {
    console.error("[auth] unexpected error", error);
    return { ok: false, message: UNEXPECTED, values };
  }
  if (error.status === 429) {
    return { ok: false, code: "rate_limited", message: RATE_LIMITED, values };
  }
  if (error.status === 422) {
    const known = Object.entries(error.fields ?? {}).filter(([name]) =>
      fields.includes(name),
    );
    return known.length
      ? {
          ok: false,
          message: CHECK_FIELDS,
          fieldErrors: Object.fromEntries(known),
          values,
        }
      : {
          ok: false,
          message: "Please check your details and try again.",
          values,
        };
  }
  if (error.status >= 500) return { ok: false, message: UNAVAILABLE, values };
  return { ok: false, message: UNEXPECTED, values };
}

// ---- Sign-up ---------------------------------------------------------------

export async function register(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    business_name: field(formData, "business_name"),
    contact_name: field(formData, "contact_name"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    postcode: field(formData, "postcode"),
    plan: field(formData, "plan"),
    accept_terms: field(formData, "accept_terms"),
  };
  const values = {
    ...raw,
    email: raw.email.trim(),
  };

  const parsed = registerSchema.safeParse({
    ...raw,
    password: field(formData, "password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: CHECK_FIELDS,
      fieldErrors: fieldErrorsOf(parsed.error),
      values,
    };
  }

  const sent: AuthState = { ok: true, values: { email: parsed.data.email } };

  // Honeypot: a bot that fills the hidden field gets the normal confirmation
  // and nothing is created.
  if (field(formData, "website")) return sent;

  try {
    await api.register(
      { ...parsed.data, accept_terms: true },
      await getClientIp(),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return {
        ok: false,
        code: "rate_limited",
        message:
          "Too many sign-up attempts from this connection. Please try again later.",
        values,
      };
    }
    return failure(error, { values, fields: Object.keys(raw) });
  }

  // The same confirmation whether or not the address was already registered.
  return sent;
}

export async function resendVerification(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = email.safeParse(field(formData, "email"));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { email: "Enter a valid email address." },
    };
  }

  try {
    await api.resendVerification(parsed.data, await getClientIp());
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return {
        ok: false,
        code: "rate_limited",
        message:
          "We've already sent several emails. Please wait a while before asking for another.",
      };
    }
    return failure(error, { fields: ["email"] });
  }

  return {
    ok: true,
    message:
      "If that address has an account waiting to be verified, a new link is on its way.",
  };
}

export async function verifyEmail(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const invalid: AuthState = {
    ok: false,
    code: "invalid_token",
    message: "This verification link is invalid or has expired.",
  };

  const parsed = token.safeParse(field(formData, "token"));
  if (!parsed.success) return invalid;

  try {
    await api.verifyEmail(parsed.data);
  } catch (error) {
    if (error instanceof ApiError && [400, 404, 422].includes(error.status)) {
      return invalid;
    }
    return failure(error);
  }

  return { ok: true };
}

// ---- Sign-in and sign-out --------------------------------------------------

export async function login(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = { email: field(formData, "email").trim() };
  const parsed = loginSchema.safeParse({
    email: values.email,
    password: field(formData, "password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(parsed.error), values };
  }

  let tokens: TokenPair;
  try {
    tokens = await api.login(
      parsed.data.email,
      parsed.data.password,
      await getClientIp(),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      // One message for an unknown address and a wrong password.
      if (error.status === 401 || error.status === 422) {
        return {
          ok: false,
          message: "The email address or password is incorrect.",
          values,
        };
      }
      if (error.code === "email_not_verified") {
        return {
          ok: false,
          code: "email_not_verified",
          message:
            "Please verify your email address before signing in. We can send you a new link.",
          values: { email: parsed.data.email },
        };
      }
      if (error.code === "account_disabled") {
        return {
          ok: false,
          message: `This account has been disabled. Please contact ${site.email} for help.`,
          values,
        };
      }
      if (error.status === 429) {
        return {
          ok: false,
          code: "rate_limited",
          message:
            "Too many sign-in attempts. Please wait a minute and try again.",
          values,
        };
      }
    }
    return failure(error, { values });
  }

  await setSession(tokens);
  // Only same-site paths are honoured (open-redirect protection).
  redirect(safeNextPath(field(formData, "next")) ?? routes.account);
}

export async function signOut() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await api.logout(refreshToken);
    } catch {
      // The cookies are removed below either way, which signs this browser out.
    }
  }
  await clearSession();
  redirect(`${routes.login}?signed_out=1`);
}

// ---- Password reset --------------------------------------------------------

export async function requestPasswordReset(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = { email: field(formData, "email").trim() };
  const parsed = email.safeParse(values.email);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { email: "Enter a valid email address." },
      values,
    };
  }

  try {
    await api.forgotPassword(parsed.data, await getClientIp());
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return {
        ok: false,
        code: "rate_limited",
        message:
          "We've already sent several emails. Please wait a while before asking for another.",
        values,
      };
    }
    return failure(error, { values, fields: ["email"] });
  }

  // The same confirmation whether or not an account exists.
  return { ok: true, values: { email: parsed.data } };
}

export async function resetPassword(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const invalid: AuthState = {
    ok: false,
    code: "invalid_token",
    message: "This password reset link is invalid or has expired.",
  };

  const parsedToken = token.safeParse(field(formData, "token"));
  if (!parsedToken.success) return invalid;

  const parsedPassword = newPassword.safeParse(field(formData, "password"));
  if (!parsedPassword.success) {
    return {
      ok: false,
      fieldErrors: {
        password: parsedPassword.error.issues[0]?.message ?? CHECK_FIELDS,
      },
    };
  }

  try {
    await api.resetPassword(parsedToken.data, parsedPassword.data);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400 || error.status === 404) return invalid;
      if (error.status === 422) {
        // The token is well formed, so a 422 is about the password.
        return error.fields?.password
          ? { ok: false, fieldErrors: { password: error.fields.password } }
          : invalid;
      }
    }
    return failure(error);
  }

  // A reset signs the account out everywhere, this browser included.
  await clearSession();
  redirect(`${routes.login}?reset=success`);
}
