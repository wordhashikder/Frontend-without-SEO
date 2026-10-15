import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { ApiError, api } from "@/lib/api";
import { CUSTOMER_COOKIE, customerCookieOptions } from "@/lib/session-cookies";
import type { CustomerOverview } from "@/lib/types";

/*
 * The homeowner's session after a magic link. The API's opaque session token
 * lives in an httpOnly cookie on this origin and never reaches client
 * components. Cookies can only be written from Server Actions and Route
 * Handlers (the verify route and the sign-out action).
 */

export async function setCustomerSession(token: string, expiresIn: number) {
  (await cookies()).set(
    CUSTOMER_COOKIE,
    token,
    customerCookieOptions(expiresIn),
  );
}

export async function clearCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function getCustomerToken() {
  return (await cookies()).get(CUSTOMER_COOKIE)?.value || undefined;
}

export type CustomerSession = {
  token: string;
  overview: CustomerOverview;
};

/**
 * The signed-in customer and their requests, verified by the API, or `null`
 * when there is no valid session (no cookie, expired or ended). Memoised so one
 * render makes one API call. An unreachable API throws: an outage must not
 * look like being signed out.
 */
export const getCustomerSession = cache(
  async (): Promise<CustomerSession | null> => {
    const token = await getCustomerToken();
    if (!token) return null;
    try {
      return { token, overview: await api.customerOverview(token) };
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        return null;
      }
      throw error;
    }
  },
);
