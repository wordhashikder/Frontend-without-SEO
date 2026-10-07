import type { CSSProperties } from "react";
import { CheckBullet } from "@/components/ui/icon-badge";
import { StarRating } from "@/components/ui/star-rating";
import type { Review } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

const avatarTones = [
  "bg-[#dff3e7] text-forest",
  "bg-[#d7e9f7] text-ink",
  "bg-[#f8e6dd] text-ink",
  "bg-[#e8e3f8] text-ink",
];

export function ReviewCard({
  review,
  className,
}: {
  review: Review;
  className?: string;
}) {
  const tone =
    avatarTones[review.author_name.charCodeAt(0) % avatarTones.length];
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-soft sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <StarRating rating={review.rating} />
        <time dateTime={review.created_at} className="text-xs text-subtle">
          Posted {timeAgo(review.created_at)}
        </time>
      </div>
      <h3 className="mt-4 text-base font-semibold">{review.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed">{review.body}</p>
      <footer className="mt-5 flex items-center justify-between gap-3 text-[13px]">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              tone,
            )}
          >
            {review.author_name[0]?.toUpperCase()}
          </span>
          <span className="truncate">
            <span className="font-semibold text-ink">{review.author_name}</span>
            {review.author_location ? ` in ${review.author_location}` : null}
          </span>
        </span>
        {review.verified ? (
          <span className="flex shrink-0 items-center gap-1.5 text-xs">
            Verified <CheckBullet className="size-4" />
          </span>
        ) : null}
      </footer>
    </article>
  );
}

/**
 * Cards per marquee group. A desktop card plus its spacing is 340px, so eight
 * cards (2720px) out-span a 2560px display; `min-w-full` covers anything wider.
 */
const MIN_CARDS_PER_GROUP = 8;
/** Seconds a card takes to travel its own width: a constant ~24px per second. */
const SECONDS_PER_CARD = 14;

/**
 * One endlessly scrolling row.
 *
 * Two identical groups sit side by side and each slides left by exactly its
 * own width, so the loop point is invisible. A group is never narrower than
 * the viewport, whatever the screen size or number of reviews, which is what
 * keeps a blank gap from ever opening at the end of a cycle.
 */
function Row({ reviews, reverse }: { reviews: Review[]; reverse?: boolean }) {
  // Whole sets are repeated so a short list still fills a wide screen in order.
  const repeats = Math.ceil(MIN_CARDS_PER_GROUP / reviews.length);
  const cards = Array.from({ length: repeats }, () => reviews).flat();
  const style = {
    "--marquee-duration": `${cards.length * SECONDS_PER_CARD}s`,
  } as CSSProperties;

  return (
    // Reduced motion: no animation, the row becomes a plain scrollable list.
    <div
      className="flex overflow-hidden motion-reduce:overflow-x-auto"
      style={style}
    >
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className={cn(
            "flex min-w-full shrink-0 animate-marquee justify-around will-change-transform",
            "group-has-[input:checked]/reviews:[animation-play-state:paused]",
            "motion-reduce:mx-auto motion-reduce:min-w-0 motion-reduce:animate-none motion-reduce:justify-start",
            reverse && "[animation-direction:reverse]",
            copy === 1 && "motion-reduce:hidden",
          )}
        >
          {cards.map((review, index) => {
            const isRepeat = index >= reviews.length;
            return (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: the list is repeated on purpose
                key={`${review.id}-${index}`}
                aria-hidden={isRepeat || undefined}
                className={cn(
                  // Half the 20px spacing on each side keeps the seam between groups even.
                  "mx-2.5 w-75 shrink-0 sm:w-[320px]",
                  isRepeat && "motion-reduce:hidden",
                )}
              >
                <ReviewCard review={review} />
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}

/**
 * "Real people. Real results." Two rows of published reviews drifting in
 * opposite directions. Renders nothing until real reviews exist.
 */
export function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const split = Math.ceil(reviews.length / 2);
  const rows =
    reviews.length >= 6
      ? [reviews.slice(0, split), reviews.slice(split)]
      : [reviews];

  return (
    <section
      aria-labelledby="reviews-heading"
      className="group/reviews relative overflow-hidden py-14 md:py-20"
    >
      <div className="mx-auto max-w-2xl px-5 text-center">
        <h2
          id="reviews-heading"
          className="text-[28px] font-bold leading-tight sm:text-4xl"
        >
          Real people. Real results.
        </h2>
        <p className="mt-3 text-[15px]">
          See what homeowners and businesses say about finding EV charger
          installers through PickASparky.
        </p>
      </div>
      {/*
        Pause control for keyboard and screen-reader users (WCAG 2.2.2). It is
        invisible until focused, needs no JavaScript, and is hidden entirely
        when the visitor's system already has motion turned off.
      */}
      <label className="pointer-events-none absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white opacity-0 focus-within:pointer-events-auto focus-within:opacity-100 motion-reduce:hidden">
        <input type="checkbox" className="size-4 accent-primary" />
        Pause moving reviews
      </label>
      <div className="mt-10 space-y-5">
        {rows.map((row, index) => (
          <Row key={row[0].id} reviews={row} reverse={index % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
