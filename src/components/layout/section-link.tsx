"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";

/**
 * Taking a reader to part of a page without putting a `#fragment` in any URL.
 *
 * - `ScrollButton`: a button that scrolls to a section of the current page.
 * - `SectionLink`: a normal link to another page that, once the page has opened, scrolls to
 *   one of its sections. The URL stays the plain page URL, so there is one canonical address.
 * - `SectionScroll` (mounted once in the layout) performs the scroll after navigation.
 */
const STORAGE_KEY = "pas:section";

function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
}

export function ScrollButton({
  target,
  className,
  current,
  children,
}: {
  target: string;
  className?: string;
  /** Marks the button as the reader's current location (e.g. in a table of contents). */
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-current={current ? "location" : undefined}
      onClick={() => scrollToSection(target)}
      className={`cursor-pointer text-left ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SectionLink({
  href,
  section,
  className,
  rel,
  current,
  label,
  children,
}: {
  href: string;
  section: string;
  className?: string;
  rel?: string;
  /** Marks the link as the reader's current page (e.g. in a pager). */
  current?: boolean;
  label?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={className}
      rel={rel}
      aria-current={current ? "page" : undefined}
      aria-label={label}
      onClick={(event) => {
        if (pathname === href) {
          // Already on the page: just move to the section.
          event.preventDefault();
          scrollToSection(section);
          return;
        }
        try {
          sessionStorage.setItem(STORAGE_KEY, section);
        } catch {
          // Storage can be blocked: the page then simply opens at the top.
        }
      }}
    >
      {children}
    </Link>
  );
}

export function SectionScroll() {
  const pathname = usePathname();
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs for every page the reader opens
  useEffect(() => {
    let section: string | null = null;
    try {
      section = sessionStorage.getItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (!section) return;
    // After the page has been shown (the router scrolls to the top first).
    const timer = window.setTimeout(() => scrollToSection(section), 60);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
