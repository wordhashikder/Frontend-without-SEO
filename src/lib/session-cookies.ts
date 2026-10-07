/**
 * Session cookie names and flags, shared by `src/lib/session.ts` (Server
 * Components and Server Actions) and `src/proxy.ts`. Kept free of
 * `next/headers` so the proxy bundle can import it.
 */

/** Short-lived JWT access token issued by the API. */
export const ACCESS_COOKIE = "pas_access";
/** Opaque, rotating refresh token issued by the API. */
export const REFRESH_COOKIE = "pas_refresh";

/** Matches the API's REFRESH_TOKEN_EXPIRE_DAYS (30 days). */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
/**
 * The access cookie expires slightly before the token inside it, so the
 * browser never presents a token the API has just stopped accepting.
 */
const ACCESS_EXPIRY_MARGIN = 15;

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export const accessCookieOptions = (expiresIn: number) => ({
  ...baseOptions,
  maxAge: Math.max(Math.floor(expiresIn) - ACCESS_EXPIRY_MARGIN, 1),
});

export const refreshCookieOptions = () => ({
  ...baseOptions,
  maxAge: REFRESH_MAX_AGE,
});

/**
 * Open-redirect guard for `?next=`. Accepts only a same-site relative path:
 * one leading slash, no scheme, no protocol-relative or backslash tricks.
 */
export function safeNextPath(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 512) return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  // Backslashes and control characters are normalised to "/" or dropped by
  // browsers, which can turn "/\evil.example" into "//evil.example".
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (char === "\\" || code < 0x20 || code === 0x7f) return undefined;
  }
  try {
    const base = "http://internal.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return undefined;
    return `${url.pathname}${url.search}`;
  } catch {
    return undefined;
  }
}
