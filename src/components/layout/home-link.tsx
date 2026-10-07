"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { routes } from "@/lib/site";

/**
 * The logo link, in the header and the footer. It always points to "/".
 * From any other page that loads the homepage at the top. On the homepage
 * itself the page scrolls back to the top in place, without a reload, and the
 * address stays "/".
 */
export function HomeLink(props: Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();
  return (
    <Link
      {...props}
      href={routes.home}
      onClick={(event) => {
        // Leave new-tab and other modified clicks to the browser.
        const plainClick =
          event.button === 0 &&
          !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
        if (pathname !== routes.home || !plainClick) return;
        event.preventDefault();
        // A fragment left in the address bar (an old "/#top" link) is removed;
        // a query string is kept.
        if (window.location.hash) {
          window.history.replaceState(
            null,
            "",
            routes.home + window.location.search,
          );
        }
        // Smooth or instant, following the `scroll-behavior` set in globals.css.
        window.scrollTo({ top: 0 });
      }}
    />
  );
}