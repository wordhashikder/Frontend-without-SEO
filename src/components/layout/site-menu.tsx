"use client";

import { LogIn, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { headerMenu } from "@/lib/site";

const icons = { join: UserRound, login: LogIn } as const;

/**
 * The header's menu button and its two options for electricians: join and
 * sign in. The same dropdown is used on every screen size.
 * The links are always in the HTML (hidden when closed) so crawlers can follow them.
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close after navigation.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => setOpen(false), [pathname]);

  // While open: Escape closes and returns focus, and so does a press outside.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    // From `sm` the dropdown hangs from the button; on phones it is placed
    // against the header instead, so it can never run off the screen.
    <div ref={rootRef} className="sm:relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface"
      >
        <Menu aria-hidden className="size-5" strokeWidth={2.25} />
      </button>

      <nav
        id={panelId}
        aria-label="Electricians"
        hidden={!open}
        className="absolute top-[62px] right-4 z-50 w-[272px] max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-white p-1.5 shadow-card sm:top-full sm:right-0 sm:mt-1.5"
      >
        <ul className="divide-y divide-line">
          {headerMenu.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li key={item.href} className="py-1 first:pt-0 last:pb-0">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center gap-3.5 rounded-md px-3 text-[15px] font-medium text-ink hover:bg-mint-soft focus-visible:bg-mint-soft"
                >
                  <Icon
                    aria-hidden
                    className="size-5 shrink-0 text-forest"
                    strokeWidth={2}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
