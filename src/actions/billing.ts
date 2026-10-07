"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, api } from "@/lib/api";
import { loginPath, requireSession } from "@/lib/session";
import { site } from "@/lib/site";

/** Result of a billing action, consumed by `useActionState`. */
export type BillingState = { ok: boolean; message?: string };

const paidPlan = z.enum(["pro", "premium"]);

/** Stripe-hosted pages we are prepared to send an installer to. */
const STRIPE_HOSTS = ["checkout.stripe.com", "billing.stripe.com"];

const UNAVAILABLE =
  "We couldn't reach the service. Please try again in a moment.";

/**
 * The API returns a Stripe URL. It is still checked before redirecting, so a
 * misconfigured or compromised upstream cannot turn this into an open redirect.
 */
function stripeUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && STRIPE_HOSTS.includes(url.hostname)) {
      return url.toString();
    }
  } catch {
    // Fall through to the failure below.
  }
  return null;
}

function failure(error: unknown): BillingState {
  if (!(error instanceof ApiError)) {
    console.error("[billing] unexpected error", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
  // The session ended between loading the page and pressing the button.
  if (error.status === 401) redirect(loginPath());

  switch (error.code) {
    case "service_not_configured":
      return {
        ok: false,
        message: `Online payment isn't available right now. Please try again later or email ${site.email}.`,
      };
    case "already_subscribed":
      return {
        ok: false,
        message:
          "You already have an active subscription. Use Manage billing to make changes.",
      };
    case "no_billing_account":
      return {
        ok: false,
        message: `There's no billing account for this business yet. Email ${site.email} if you need help.`,
      };
    case "rate_limited":
      return {
        ok: false,
        message: "Too many attempts. Please wait a minute and try again.",
      };
  }
  if (error.status === 429) {
    return {
      ok: false,
      message: "Too many attempts. Please wait a minute and try again.",
    };
  }
  if (error.status >= 500) return { ok: false, message: UNAVAILABLE };
  return { ok: false, message: "Something went wrong. Please try again." };
}

const NOT_AN_INSTALLER: BillingState = {
  ok: false,
  message: "This account isn't linked to an installer business.",
};

/**
 * Every billing action starts here: the session is re-verified with the API
 * (the page having rendered proves nothing about this request). Redirects to
 * the login page when signed out; an API outage becomes a message.
 */
async function installerSession(): Promise<
  { token: string } | { failed: BillingState }
> {
  try {
    const { token, user } = await requireSession();
    return user.installer ? { token } : { failed: NOT_AN_INSTALLER };
  } catch (error) {
    if (error instanceof ApiError) return { failed: failure(error) };
    throw error;
  }
}

/** Send a signed-in installer to Stripe Checkout for a paid plan. */
export async function startCheckout(
  _previous: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const plan = paidPlan.safeParse(formData.get("plan"));
  if (!plan.success) {
    return { ok: false, message: "Choose Pro or Premium to upgrade." };
  }

  const session = await installerSession();
  if ("failed" in session) return session.failed;

  let destination: string | null;
  try {
    const checkout = await api.createCheckoutSession(session.token, plan.data);
    destination = stripeUrl(checkout.url);
  } catch (error) {
    return failure(error);
  }

  if (!destination) {
    console.error("[billing] checkout session returned an unexpected URL");
    return { ok: false, message: UNAVAILABLE };
  }
  redirect(destination);
}

/** Send a signed-in installer to the Stripe billing portal. */
export async function openBillingPortal(
  _previous: BillingState,
  _formData: FormData,
): Promise<BillingState> {
  const session = await installerSession();
  if ("failed" in session) return session.failed;

  let destination: string | null;
  try {
    const portal = await api.createPortalSession(session.token);
    destination = stripeUrl(portal.url);
  } catch (error) {
    return failure(error);
  }

  if (!destination) {
    console.error("[billing] portal session returned an unexpected URL");
    return { ok: false, message: UNAVAILABLE };
  }
  redirect(destination);
}
