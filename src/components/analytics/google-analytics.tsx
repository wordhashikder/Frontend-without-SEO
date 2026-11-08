"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { isTrackedPath, measuredLocation } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/**
 * Google tag (gtag.js) for every public page.
 *
 * - The script loads only on public pages: a visit that starts on a private
 *   page (account, one-time links, messages) never loads it.
 * - Page views are sent by hand with a cleaned URL (no query string except
 *   campaign tags), once per page, including client-side navigation.
 *   In GA4 switch off Enhanced measurement > "Page changes based on browser
 *   history events", or those navigations are counted twice.
 * - If someone moves from a public page to a private one, Google's own
 *   opt-out switch pauses every hit until they are back on a public page.
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const started = useRef(false);
  const tracked = isTrackedPath(pathname);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `pathname` is the trigger, so every navigation sends one page view
  useEffect(() => {
    const disableKey = `ga-disable-${measurementId}` as const;
    window[disableKey] = !tracked;
    if (!tracked) return;

    window.dataLayer = window.dataLayer ?? [];
    if (!window.gtag) {
      // gtag.js reads the queue as Arguments objects, so `arguments` is required.
      window.gtag = function gtag() {
        // biome-ignore lint/complexity/noArguments: gtag.js needs an Arguments object
        window.dataLayer?.push(arguments);
      };
    }
    if (!started.current) {
      started.current = true;
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false });
    }
    window.gtag("event", "page_view", {
      page_location: measuredLocation(window.location),
      page_path: window.location.pathname,
    });
  }, [pathname, tracked, measurementId]);

  if (!tracked && !started.current) return null;
  return (
    <Script
      id="google-tag"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  );
}
