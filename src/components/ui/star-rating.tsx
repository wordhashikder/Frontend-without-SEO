import { cn } from "@/lib/utils";

const STAR_PATH =
  "M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8L10 14.5l-5.1 2.9 1.1-5.8-4.3-4 5.8-.7L10 1.6z";

type StarRatingProps = {
  /** 0–5. Fractions render as a partially filled star. */
  rating: number;
  size?: "sm" | "md";
  className?: string;
};

/** Five stars with an accessible text alternative. */
export function StarRating({
  rating,
  size = "md",
  className,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const dimension = size === "sm" ? "size-3.5" : "size-4";
  return (
    <span
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, clamped - index));
        return (
          <span key={index} className={cn("relative block", dimension)}>
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="absolute inset-0 text-[#d9dee4]"
            >
              <path d={STAR_PATH} fill="currentColor" />
            </svg>
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="absolute inset-0 text-star"
              style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
            >
              <path d={STAR_PATH} fill="currentColor" />
            </svg>
          </span>
        );
      })}
    </span>
  );
}
