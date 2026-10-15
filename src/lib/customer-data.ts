import "server-only";

import { cache } from "react";
import { ApiError, api } from "@/lib/api";
import { getCustomerSession } from "@/lib/customer-session";
import type { RequestDetail, RequestSummary } from "@/lib/types";

/** The request a page shows: `?r=` if it is theirs, otherwise the newest. */
export const getSelectedRequest = cache(
  async (
    wanted?: string,
  ): Promise<{
    requests: RequestSummary[];
    detail: RequestDetail | null;
  } | null> => {
    const session = await getCustomerSession();
    if (!session) return null;
    const { requests } = session.overview;
    const chosen = requests.find((r) => r.id === wanted) ?? requests[0];
    if (!chosen) return { requests, detail: null };
    try {
      return {
        requests,
        detail: await api.customerRequest(session.token, chosen.id),
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { requests, detail: null };
      }
      throw error;
    }
  },
);
