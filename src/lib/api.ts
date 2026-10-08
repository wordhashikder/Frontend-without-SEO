import "server-only";

import type {
  ApiErrorBody,
  BlogPostDetail,
  BlogPostSummary,
  ContactMessageCreate,
  CurrentUser,
  InstallerCard,
  InstallerDetail,
  InstallerEnquiryCreate,
  LocationDetail,
  LocationDirectory,
  LocationSummary,
  MessageResponse,
  Paginated,
  Plan,
  PostcodeLookup,
  QuoteRequestCreate,
  QuoteRequestCreated,
  RegisterRequest,
  Review,
  ReviewCreate,
  ReviewInvite,
  TokenPair,
  UrlResponse,
} from "@/lib/types";

/**
 * Server-side API client. The browser never talks to FastAPI directly:
 * pages fetch here during render and forms go through Server Actions,
 * so tokens stay in httpOnly cookies and the API URL can be internal.
 */
const API_URL = (process.env.API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);
const API_PREFIX = "/api/v1";
/** Shared secret proving a request comes from this frontend (see backend INTERNAL_API_KEY). */
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
if (!INTERNAL_API_KEY && process.env.NODE_ENV === "production") {
  console.warn(
    "[api] INTERNAL_API_KEY is not set: the API will rate-limit every visitor as one client.",
  );
}
const TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  /** Visitor IP for per-visitor rate limiting on public forms. */
  clientIp?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Seconds to keep a GET response in the Next.js data cache. */
  revalidate?: number;
  tags?: string[];
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const {
    method = "GET",
    body,
    token,
    clientIp,
    query,
    revalidate,
    tags,
  } = options;

  const url = new URL(`${API_URL}${API_PREFIX}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const cacheable = method === "GET" && !token && revalidate !== undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(clientIp && INTERNAL_API_KEY
          ? { "X-Client-IP": clientIp, "X-Internal-Token": INTERNAL_API_KEY }
          : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(cacheable ? { next: { revalidate, tags } } : { cache: "no-store" }),
    });
  } catch {
    throw new ApiError(
      503,
      "service_unavailable",
      "We couldn't reach the service. Please try again in a moment.",
    );
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiErrorBody
    | null;

  if (!response.ok) {
    const error = (payload as ApiErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "unknown_error",
      error?.message ?? "Something went wrong. Please try again.",
      error?.fields,
    );
  }

  return payload as T;
}

/**
 * For supporting content (lists, directories): an unreachable API degrades to
 * `fallback` so the rest of the page still renders.
 */
async function safe<T, F>(promise: Promise<T>, fallback: F): Promise<T | F> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`[api] ${error.status} ${error.code}: ${error.message}`);
      return fallback;
    }
    throw error;
  }
}

/**
 * For the primary resource of a page: a 404 becomes `null` (render notFound()),
 * anything else propagates to the error boundary so an outage is never cached
 * as a missing page.
 */
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;

export const api = {
  // ---- Locations ---------------------------------------------------------
  locations: () =>
    safe(
      request<LocationSummary[]>("/locations", {
        revalidate: HOUR,
        tags: ["locations"],
      }),
      [] as LocationSummary[],
    ),

  location: (slug: string) =>
    orNull(
      request<LocationDetail>(`/locations/${encodeURIComponent(slug)}`, {
        revalidate: 5 * MINUTE,
        tags: ["locations", `location:${slug}`],
      }),
    ),

  /** The "Find trusted installers in your area" columns: the same on every page. */
  locationDirectory: () =>
    safe(
      request<LocationDirectory>("/locations/directory", {
        revalidate: HOUR,
        tags: ["locations"],
      }),
      null,
    ),

  // ---- Installers --------------------------------------------------------
  installers: (params: {
    location?: string;
    featured?: boolean;
    page?: number;
    pageSize?: number;
  }) =>
    safe(
      request<Paginated<InstallerCard>>("/installers", {
        query: {
          location: params.location,
          featured: params.featured,
          page: params.page ?? 1,
          page_size: params.pageSize ?? 12,
        },
        revalidate: 5 * MINUTE,
        tags: ["installers"],
      }),
      null,
    ),

  installer: (slug: string) =>
    orNull(
      request<InstallerDetail>(`/installers/${encodeURIComponent(slug)}`, {
        revalidate: 5 * MINUTE,
        tags: ["installers", `installer:${slug}`],
      }),
    ),

  installerReviews: (slug: string, page = 1, pageSize = 6) =>
    safe(
      request<Paginated<Review>>(
        `/installers/${encodeURIComponent(slug)}/reviews`,
        {
          query: { page, page_size: pageSize },
          revalidate: 5 * MINUTE,
          tags: ["reviews", `installer:${slug}`],
        },
      ),
      null,
    ),

  similarInstallers: (slug: string, limit = 4) =>
    safe(
      request<InstallerCard[]>(
        `/installers/${encodeURIComponent(slug)}/similar`,
        {
          query: { limit },
          revalidate: 5 * MINUTE,
          tags: ["installers"],
        },
      ),
      [] as InstallerCard[],
    ),

  // ---- Reviews -----------------------------------------------------------
  featuredReviews: (limit = 10) =>
    safe(
      request<Review[]>("/reviews/featured", {
        query: { limit },
        revalidate: 5 * MINUTE,
        tags: ["reviews"],
      }),
      [] as Review[],
    ),

  reviewInvite: (token: string) =>
    request<ReviewInvite>("/reviews/invite", { query: { token } }),

  createReview: (body: ReviewCreate, clientIp?: string) =>
    request<MessageResponse>("/reviews", { method: "POST", body, clientIp }),

  // ---- Blog --------------------------------------------------------------
  /**
   * Published posts, newest first. The primary resource of the blog pages, so
   * an outage propagates (never cached as an empty blog).
   */
  blogPosts: (params: {
    page?: number;
    pageSize?: number;
    category?: string;
  }) =>
    request<Paginated<BlogPostSummary>>("/blog/posts", {
      query: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 9,
        category: params.category,
      },
      revalidate: 5 * MINUTE,
      tags: ["blog"],
    }),

  blogPost: (slug: string) =>
    orNull(
      request<BlogPostDetail>(`/blog/posts/${encodeURIComponent(slug)}`, {
        revalidate: 5 * MINUTE,
        tags: ["blog", `blog:${slug}`],
      }),
    ),

  relatedBlogPosts: (slug: string, limit = 3) =>
    safe(
      request<BlogPostSummary[]>(
        `/blog/posts/${encodeURIComponent(slug)}/related`,
        {
          query: { limit },
          revalidate: 5 * MINUTE,
          tags: ["blog"],
        },
      ),
      [] as BlogPostSummary[],
    ),

  // ---- Quotes & contact (mutations: errors propagate to the caller) -------
  lookupPostcode: (postcode: string, clientIp?: string) =>
    request<PostcodeLookup>(`/postcodes/${encodeURIComponent(postcode)}`, {
      clientIp,
    }),

  createQuote: (body: QuoteRequestCreate, clientIp?: string) =>
    request<QuoteRequestCreated>("/quotes", { method: "POST", body, clientIp }),

  sendContactMessage: (body: ContactMessageCreate, clientIp?: string) =>
    request<MessageResponse>("/contact", { method: "POST", body, clientIp }),

  sendInstallerEnquiry: (
    slug: string,
    body: InstallerEnquiryCreate,
    clientIp?: string,
  ) =>
    request<MessageResponse>(
      `/installers/${encodeURIComponent(slug)}/enquiries`,
      { method: "POST", body, clientIp },
    ),

  // ---- Auth --------------------------------------------------------------
  register: (body: RegisterRequest, clientIp?: string) =>
    request<MessageResponse>("/auth/register", {
      method: "POST",
      body,
      clientIp,
    }),

  login: (email: string, password: string, clientIp?: string) =>
    request<TokenPair>("/auth/login", {
      method: "POST",
      body: { email, password },
      clientIp,
    }),

  refresh: (refreshToken: string) =>
    request<TokenPair>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    }),

  logout: (refreshToken: string) =>
    request<void>("/auth/logout", {
      method: "POST",
      body: { refresh_token: refreshToken },
    }),

  verifyEmail: (token: string) =>
    request<MessageResponse>("/auth/verify-email", {
      method: "POST",
      body: { token },
    }),

  resendVerification: (email: string, clientIp?: string) =>
    request<MessageResponse>("/auth/resend-verification", {
      method: "POST",
      body: { email },
      clientIp,
    }),

  forgotPassword: (email: string, clientIp?: string) =>
    request<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      clientIp,
    }),

  resetPassword: (token: string, password: string) =>
    request<MessageResponse>("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    }),

  me: (token: string) => request<CurrentUser>("/auth/me", { token }),

  // ---- Billing -----------------------------------------------------------
  createCheckoutSession: (token: string, plan: Exclude<Plan, "free">) =>
    request<UrlResponse>("/billing/checkout-session", {
      method: "POST",
      token,
      body: { plan },
    }),

  createPortalSession: (token: string) =>
    request<UrlResponse>("/billing/portal-session", {
      method: "POST",
      token,
    }),
};
