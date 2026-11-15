"use client";

/** "Skip to main content" for keyboard users: moves focus to the page's `<main>` (no `#` link). */
export function SkipLink() {
  return (
    <button
      type="button"
      onClick={() => document.getElementById("main")?.focus()}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:cursor-pointer focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      Skip to main content
    </button>
  );
}
