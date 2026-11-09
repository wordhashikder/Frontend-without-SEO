"use client";

import "vanilla-cookieconsent/dist/cookieconsent.css";
import "./cookie-consent.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isTrackedPath } from "@/lib/analytics";
import { loadConsent } from "./consent-manager";

/**
 * The cookie banner. It appears on public pages until the visitor chooses, and
 * stays out of the way on private pages (account, one-time links, messages),
 * which are never measured. Choices are remembered for six months.
 */
export function CookieConsent() {
  const pathname = usePathname();
  const tracked = isTrackedPath(pathname);

  useEffect(() => {
    let current = true;
    loadConsent()
      .then((library) => {
        if (!current) return;
        if (tracked && !library.validConsent()) library.show();
        else library.hide();
      })
      .catch(() => {
        // The script could not load: the site works, and analytics stays off.
      });
    return () => {
      current = false;
    };
  }, [tracked]);

  return null;
}
