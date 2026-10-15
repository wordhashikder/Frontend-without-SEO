"use client";

import {
  CircleHelp,
  ClipboardList,
  FileText,
  type LucideIcon,
  MessageSquare,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BASE = "/uk/my-quotes/";

type Item = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  badge?: number;
};

/** Left navigation on desktop; a bottom tab bar on phones. */
export function CustomerNav({
  quotes,
  unread,
  query,
}: {
  quotes: number;
  unread: number;
  /** `?r=…` when the customer has more than one request. */
  query: string;
}) {
  const pathname = usePathname();
  const items: Item[] = [
    { href: BASE, label: "My Request", short: "Request", icon: ClipboardList },
    {
      href: `${BASE}quotes/`,
      label: "Quotes",
      short: "Quotes",
      icon: FileText,
      badge: quotes,
    },
    {
      href: `${BASE}messages/`,
      label: "Messages",
      short: "Messages",
      icon: MessageSquare,
      badge: unread,
    },
    {
      href: `${BASE}details/`,
      label: "My Details",
      short: "Details",
      icon: UserRound,
    },
    {
      href: `${BASE}help/`,
      label: "Help & Support",
      short: "Help",
      icon: CircleHelp,
    },
  ];
  const active = (href: string) =>
    href === BASE ? pathname === BASE : pathname.startsWith(href);
  const withQuery = (href: string) =>
    query && (href === BASE || href.endsWith("quotes/"))
      ? `${href}${query}`
      : href;

  return (
    <>
      <nav aria-label="My quotes" className="hidden lg:block">
        <ul className="space-y-1">
          {items.map(({ href, label, icon: Icon, badge }) => (
            <li key={href}>
              <Link
                href={withQuery(href)}
                aria-current={active(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active(href)
                    ? "bg-primary-soft text-forest"
                    : "text-ink/75 hover:bg-surface hover:text-ink",
                )}
              >
                <Icon aria-hidden className="size-[18px]" strokeWidth={1.75} />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                    {badge}
                    <span className="sr-only">
                      {label === "Messages" ? " unread" : " received"}
                    </span>
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav
        aria-label="My quotes"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-[560px] grid-cols-5">
          {items.map(({ href, short, icon: Icon, badge }) => (
            <li key={href}>
              <Link
                href={withQuery(href)}
                aria-current={active(href) ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium",
                  active(href) ? "text-primary" : "text-subtle",
                )}
              >
                <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                {short}
                {badge ? (
                  <span
                    aria-hidden
                    className="absolute top-1.5 left-1/2 ml-2 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 font-semibold text-white"
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
