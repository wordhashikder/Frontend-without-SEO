import Image from "next/image";
import { HowItWorksPlayer } from "@/components/sections/how-it-works-player";
import { Container } from "@/components/ui/layout";
import { site } from "@/lib/site";
import { videoAssets } from "@/lib/video";

const LABEL =
  "A short silent video showing how PickASparky works: enter your postcode, answer a few questions, local installers are notified and you compare up to 5 quotes.";

type HowItWorksVideoProps = {
  /** Show the "How {logo} Works" heading above the video (the home page); other pages go straight to the video. */
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
            <h2
              id={headingId}
              className="mb-8 text-balance text-center text-[26px] font-bold leading-[1.15] min-[400px]:text-[30px] min-[440px]:text-[34px] tracking-[-0.01em] sm:text-5xl md:mb-10 lg:text-6xl"
            >
              How{" "}
              {/* The logo is sized in em, so it scales with the heading. Its alt text keeps the heading reading "How PickASparky Works". */}
              <Image
                src="/logo.svg"
                alt={site.name}
                width={157}
                height={32}
                unoptimized
                className="inline-block h-[1.1em] w-auto align-[-0.32em]"
              />{" "}
              Works
            </h2>
          ) : null}
          {player}
        </Container>
      )}
    </section>
  );
}
