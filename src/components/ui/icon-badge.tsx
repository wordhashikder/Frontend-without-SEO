import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  green: "bg-primary/15 text-primary",
  mint: "bg-mint text-ink",
  peach: "bg-peach text-ink",
  coral: "bg-[#fbe3d9] text-[#e2562b]",
  sand: "bg-sand text-ink",
  blue: "bg-[#e3ecfb] text-[#3b6fd4]",
  sky: "bg-[#def0f7] text-[#1c8bb8]",
  violet: "bg-[#e8e8fb] text-[#5b5bd6]",
  white: "bg-white text-ink",
} as const;

const sizes = {
  sm: { box: "size-10", icon: "size-5" },
  md: { box: "size-14", icon: "size-6" },
  lg: { box: "size-[72px]", icon: "size-8" },
} as const;

type IconBadgeProps = {
  icon: LucideIcon;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  /** Rounded square (accreditation tiles) instead of a circle. */
  square?: boolean;
  className?: string;
};

/** Tinted circle holding a line icon; the recurring icon treatment in the design. */
export function IconBadge({
  icon: Icon,
  tone = "mint",
  size = "md",
  square,
  className,
}: IconBadgeProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        square ? "rounded-lg" : "rounded-full",
        tones[tone],
        sizes[size].box,
        className,
      )}
    >
      <Icon className={sizes[size].icon} strokeWidth={1.75} />
    </span>
  );
}

/** Solid green circle with a white tick, used in feature lists. */
export function CheckBullet({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={cn("size-5 shrink-0 text-primary", className)}
    >
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path
        d="m6 10.2 2.7 2.7L14 7.6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Filled green shield with a white tick (trust marker). */
export function ShieldTick({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("size-8", className)}>
      <path
        d="M12 2.2 4 5.1v6.2c0 5 3.3 9.2 8 10.5 4.7-1.3 8-5.5 8-10.5V5.1l-8-2.9Z"
        fill="#bfe8d3"
      />
      <path
        d="M12 4.3 5.9 6.5v4.8c0 4 2.5 7.4 6.1 8.6 3.6-1.2 6.1-4.6 6.1-8.6V6.5L12 4.3Z"
        fill="#0a9b53"
      />
      <path
        d="m8.7 11.9 2.3 2.3 4.4-4.5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
