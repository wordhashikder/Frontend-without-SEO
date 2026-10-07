"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; title: string };

/** Fraction of the viewport height at which a section counts as being read. */
const READING_LINE = 0.25;

/**
 * "On this page" links. They are plain anchors, so they work without
 * JavaScript; once hydrated, the section being read is highlighted.
 */
export function LegalToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element) => element !== null);
    if (sections.length === 0) return;

    // The section being read is the last one whose top has passed a line a
    // quarter of the way down the viewport (the first one until then).
    const update = () => {
      const line = window.innerHeight * READING_LINE;
      const passed = sections.filter(
        (section) => section.getBoundingClientRect().top <= line,
      );
      setActiveId((passed.at(-1) ?? sections[0]).id);
    };

    // Fires whenever a section crosses the reading line.
    const lineObserver = new IntersectionObserver(update, {
      rootMargin: `-${READING_LINE * 100}% 0px -${(1 - READING_LINE) * 100}% 0px`,
    });
    for (const section of sections) lineObserver.observe(section);

    // Catches jumps that skip the line entirely, e.g. back to the top.
    const edgeObserver = new IntersectionObserver(update);
    edgeObserver.observe(sections[0]);
    if (navRef.current) edgeObserver.observe(navRef.current);

    return () => {
      lineObserver.disconnect();
      edgeObserver.disconnect();
    };
  }, [items]);

  return (
    <nav
      ref={navRef}
      aria-labelledby="toc-heading"
      className="rounded-xl border border-line p-5 lg:sticky lg:top-28 lg:self-start lg:rounded-none lg:border-0 lg:p-0"
    >
      <h2
        id="toc-heading"
        className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted"
      >
        On this page
      </h2>
      <ol className="mt-3 border-l border-line lg:mt-2.5">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "-ml-px flex min-h-10 items-center border-l-2 py-1 pl-4 text-sm leading-snug transition-colors lg:min-h-9",
                  active
                    ? "border-primary font-semibold text-primary"
                    : "border-transparent text-muted hover:text-ink",
                )}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
