"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentProps, type MouseEvent, useLayoutEffect } from "react";
import { routes } from "@/lib/site";

/**
 * Set by a logo click on another page; read once the homepage has rendered.
 * Module scope, so the header and footer logos share it.
 */
let scrollHomeToTop = false;

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 &&
  !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

/** Jump (not glide) to the very top, whatever `scroll-behavior` the page sets. */
const jumpToTop = () =>
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });

/**
 * The logo link, in the header and the footer. It always points to "/" and
 * always lands on the top of the homepage, from any page:
 *
 * - From another page, the homepage is shown scrolled to the very top. Next.js
 *   only scrolls when the new page's first element is out of view, so it is
 *   not left to decide: the scroll is forced as the homepage renders.
 * - On the homepage itself, the page scrolls back to the top in place, without
 *   a reload, and the address stays "/" (never "/#top").
 */
export function HomeLink(props: Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();

  // Runs in the same commit that shows the new page, before the browser paints
  // it, so the homepage never flashes at the previous page's scroll position.
  useLayoutEffect(() => {
    if (!scrollHomeToTop) return;
    // Any completed navigation clears the request: if the visitor went
    // somewhere else first, a later back/forward visit keeps its own position.
    scrollHomeToTop = false;
    if (pathname === routes.home) jumpToTop();
  }, [pathname]);

  return (
    <Link
      {...props}
      href={routes.home}
      onClick={(event) => {
        props.onClick?.(event);
        // Leave new-tab and other modified clicks to the browser.
        if (event.defaultPrevented || !isPlainClick(event)) return;

        if (pathname !== routes.home) {
          scrollHomeToTop = true;
          return;
        }

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
