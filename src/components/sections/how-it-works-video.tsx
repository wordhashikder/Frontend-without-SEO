import { HowItWorksPlayer } from "@/components/sections/how-it-works-player";
import { Container, SectionHeading } from "@/components/ui/layout";
import { site } from "@/lib/site";
import { videoAssets } from "@/lib/video";

const LABEL =
  "A short silent video showing how PickASparky works: enter your postcode, answer a few questions, local installers are notified and you compare up to 5 quotes.";

type HowItWorksVideoProps = {
  /** Show the "How PickASparky Works" heading above the video (the home page); other pages go straight to the video. */
  heading?: boolean;
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
  heading = false,
  size = "wide",
  bare = false,
  className,
}: HowItWorksVideoProps) {
  const player = <HowItWorksPlayer {...videoAssets()} label={LABEL} />;
  const headingId = "how-video-heading";
  return (
    <section
      aria-labelledby={heading ? headingId : undefined}
      aria-label={heading ? undefined : "How PickASparky works"}
      className={className}
    >
      {bare ? (
        player
      ) : (
        <Container size={size}>
          {heading ? (
            <SectionHeading
              id={headingId}
              title={`How ${site.name} Works`}
              align="center"
              weight="bold"
              className="mb-7"
            />
          ) : null}
          {player}
        </Container>
      )}
    </section>
  );
}
