import { useSyncExternalStore } from "react";

/**
 * Cookie consent (UK PECR / UK GDPR), browser side. Whether the banner is on is
 * decided in lib/analytics.ts (`cookieBannerEnabled`), which server code may import.
 *
 * Strictly necessary cookies (sign-in, security, remembering this choice) need
 * no consent. Everything else, today only Google Analytics, starts after the
 * visitor clicks Accept and stops again when they change their mind.
 */

/** In-memory mirror of the visitor's analytics choice, set by the banner. */
let analyticsAllowed = false;
const listeners = new Set<() => void>();

export function setAnalyticsConsent(allowed: boolean) {
  if (allowed === analyticsAllowed) return;
  analyticsAllowed = allowed;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True only while the visitor has accepted analytics. False on the server. */
export function useAnalyticsConsent() {
  return useSyncExternalStore(
    subscribe,
    () => analyticsAllowed,
    () => false,
  );
}

/**
 * Removes Google's cookies (`_ga`, `_ga_<ID>`, and the older `_gid`/`_gat`).
 * Google writes them on the registrable domain (e.g. `.pickasparky.com`), so
 * each parent domain is tried as well as the exact host.
 */
export function eraseAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((entry) => entry.split("=")[0].trim())
    .filter(
      (name) =>
        name === "_ga" ||
        name === "_gid" ||
        name.startsWith("_ga_") ||
        name.startsWith("_gat"),
    );
  if (names.length === 0) return;

  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i++) {
    domains.push(`; domain=.${labels.slice(i).join(".")}`);
  }
  for (const name of names) {
    for (const domain of domains) {
      // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is not available in every supported browser
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}; SameSite=Lax`;
    }
  }
}
