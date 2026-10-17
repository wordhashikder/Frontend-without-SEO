"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { QUOTED_COOKIE } from "@/lib/session-cookies";
import { routes } from "@/lib/site";

const hasQuoted = () =>
  document.cookie.split("; ").some((entry) => entry === `${QUOTED_COOKIE}=1`);
const subscribe = () => () => {};

/**
 * "My Quotes" in the footer, only for visitors who have asked for a quote. The
 * footer is the same cached HTML for everyone, so the link is added in the
 * browser once the page has loaded; the server render never includes it.
 */
export function MyQuotesFooterLink() {
  const show = useSyncExternalStore(subscribe, hasQuoted, () => false);
  if (!show) return null;
  return (
    <li className="border-b border-ink/10">
      <Link
        href={routes.myQuotes}
        className="flex items-center justify-between gap-3 py-2.5 text-sm text-ink/75 hover:text-ink"
      >
        My Quotes
        <ChevronRight aria-hidden className="size-3.5 opacity-60" />
      </Link>
    </li>
  );
}
