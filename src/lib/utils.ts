import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** UK postcode (outward + inward), tolerant of spacing and case. */
export const UK_POSTCODE_PATTERN =
  "^[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}$";

export function isUkPostcode(value: string) {
  return new RegExp(UK_POSTCODE_PATTERN).test(value.trim());
}

/** "m11aa" -> "M1 1AA" */
export function formatPostcode(value: string) {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

/** "Posted 2 weeks ago" style relative date for reviews. */
export function timeAgo(iso: string, now: Date = new Date()) {
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - new Date(iso).getTime()) / 1000),
  );
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
  ];
  for (const [size, label] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "today";
}

/** Up to three initials for an installer logo fallback: "North West EV" -> "NWE". */
export function initials(name: string, max = 3) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .slice(0, max)
    .join("");
}
