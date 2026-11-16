import { HowItWorksPlayer } from "@/components/sections/how-it-works-player";
import { Container } from "@/components/ui/layout";
import { videoAssets } from "@/lib/video";

const LABEL =
  "A short silent video showing how PickASparky works: enter your postcode, answer a few questions, local installers are notified and you compare up to 5 quotes.";

type HowItWorksVideoProps = {
  /** A heading above the video (the home page); other pages go straight to the video. */
  title?: string;
  size?: "wide" | "narrow";
  /** Set when the video sits inside a column that already has the page's gutters. */
  bare?: boolean;
  className?: string;
};

/**
 * The walkthrough video, placed directly under a page's hero. Page spacing comes from
 * `className`; the video itself reserves its space (16:9), so nothing moves when it loads.
 */
export function HowItWorksVideo({
  title,
  size = "wide",
  bare = false,
  className,
}: HowItWorksVideoProps) {
  const player = <HowItWorksPlayer {...videoAssets()} label={LABEL} />;
  const headingId = "how-video-heading";
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : "How PickASparky works"}
      className={className}
    >
      {bare ? (
        player
      ) : (
        <Container size={size}>
          {title ? (
            <h2
              id={headingId}
              className="mb-8 text-center text-[34px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-5xl md:mb-10 lg:text-6xl"
            >
              {title}
            </h2>
          ) : null}
          {player}
        </Container>
      )}
    </section>
  );
}
