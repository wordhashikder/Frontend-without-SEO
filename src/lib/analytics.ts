/**
 * Google Analytics 4 (gtag.js) configuration.
 *
 * The Measurement ID lives only in the environment (`NEXT_PUBLIC_GA_MEASUREMENT_ID`),
 * so each environment decides for itself: leave it empty on staging and nothing
 * is loaded or sent; set it on production to start collecting data.
 * It is a build-time value (inlined into the bundle), like NEXT_PUBLIC_SITE_URL.
 */
const rawId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/** A valid `G-XXXXXXXXXX` ID, or undefined (analytics off). Anything else is ignored. */
export const gaMeasurementId =
  rawId && /^G-[A-Z0-9]{4,20}$/.test(rawId) ? rawId : undefined;

/**
 * The cookie banner is on whenever analytics is on (a Measurement ID is set), so
 * no environment can measure visitors without asking. Set
 * `NEXT_PUBLIC_COOKIE_BANNER=on` to preview the banner where analytics is off
 * (for example on staging). Build-time value, like the ID.
 */
export const cookieBannerEnabled =
  Boolean(gaMeasurementId) || process.env.NEXT_PUBLIC_COOKIE_BANNER === "on";

/**
 * Pages that are private to a signed-in person or reached through a one-time
 * link. They are never measured: their URLs can carry tokens.
 */
const PRIVATE_PREFIXES = [
  "/installer",
  "/review",
  "/messages",
  "/uk/my-quotes",
  "/api",
];

export function isTrackedPath(pathname: string) {
  return !PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Only campaign parameters survive in the URL sent to Google. Everything else
 * is dropped, because the quote form puts the visitor's postcode in the URL
 * and Google's terms forbid sending personal data to Analytics.
 */
const CAMPAIGN_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
];

export function measuredLocation(location: Location) {
  const params = new URLSearchParams(location.search);
  const kept = new URLSearchParams();
  for (const key of CAMPAIGN_PARAMS) {
    const value = params.get(key);
    if (value) kept.set(key, value);
  }
  const query = kept.toString();
  return `${location.origin}${location.pathname}${query ? `?${query}` : ""}`;
}
