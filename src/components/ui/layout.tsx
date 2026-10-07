import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page gutters. `wide` (1220px) is the default content width; `narrow` (1104px)
 * is used by the header and the home page, matching the Figma frames.
 */
export function Container({
  size = "wide",
  className,
  ...props
}: ComponentProps<"div"> & { size?: "wide" | "narrow" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "wide" ? "max-w-[1284px]" : "max-w-[1168px]",
        className,
      )}
      {...props}
    />
  );
}

const tones = {
  white: "bg-white",
  surface: "bg-surface",
  mint: "bg-mint-soft",
  sand: "bg-sand",
  stone: "bg-stone",
  peach: "bg-peach-soft",
} as const;

/** A full-width band with consistent vertical rhythm. */
export function Section({
  tone = "white",
  spacing = "md",
  className,
  ...props
}: ComponentProps<"section"> & {
  tone?: keyof typeof tones;
  spacing?: "sm" | "md" | "lg";
}) {
  return (
    <section
      className={cn(
        tones[tone],
        spacing === "sm" && "py-10 md:py-14",
        spacing === "md" && "py-14 md:py-20",
        spacing === "lg" && "py-16 md:py-24",
        className,
      )}
      {...props}
    />
  );
}

/** Small green uppercase label that sits above headings. */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.04em] text-primary",
        className,
      )}
      {...props}
    />
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  /** Heading level for correct document outline. */
  as?: "h1" | "h2" | "h3";
  size?: "md" | "lg";
  /** Content pages use the heavier display weight; the home page uses bold. */
  weight?: "bold" | "extrabold";
  className?: string;
  id?: string;
};

/** Eyebrow + heading + optional lead paragraph. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  as: Tag = "h2",
  size = "md",
  weight = "extrabold",
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow className="mb-2">{eyebrow}</Eyebrow> : null}
      <Tag
        id={id}
        className={cn(
          weight === "bold"
            ? "font-bold tracking-[-0.01em]"
            : "font-extrabold tracking-[-0.02em]",
          size === "md"
            ? "text-[26px] leading-tight sm:text-[32px] md:text-4xl"
            : "text-[30px] leading-[1.15] sm:text-4xl md:text-[44px]",
        )}
      >
        {title}
      </Tag>
      {lead ? (
        <p
          className={cn(
            "mt-4 text-[15px] leading-relaxed",
            align === "left" && "max-w-3xl",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
