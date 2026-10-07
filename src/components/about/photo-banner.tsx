import Image from "next/image";
import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/layout";
import { cn } from "@/lib/utils";

type PhotoBannerProps = {
  /** Id of the heading; labels the section for assistive tech. */
  id: string;
  eyebrow: string;
  title: ReactNode;
  /** `h1` for the page banner, `h2` for banners further down. */
  as?: "h1" | "h2";
  lead: ReactNode;
  image: { src: string; alt: string };
  /** Preload the photo when the banner is above the fold. */
  preload?: boolean;
  /** Call to action under the lead. */
  children?: ReactNode;
  className?: string;
  /** Overrides for the copy block, e.g. taller vertical padding. */
  contentClassName?: string;
};

/**
 * Mint band with the copy on the left and a photo bleeding in from the right.
 * On desktop the photo's left edge is masked so it dissolves into the band;
 * below `lg` the photo stacks under the copy.
 */
export function PhotoBanner({
  id,
  eyebrow,
  title,
  as: Tag = "h2",
  lead,
  image,
  preload,
  children,
  className,
  contentClassName,
}: PhotoBannerProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("relative isolate overflow-hidden bg-mint", className)}
    >
      <Container
        className={cn(
          "relative z-10 py-12 sm:py-14 lg:flex lg:min-h-[471px] lg:items-center lg:py-14",
          contentClassName,
        )}
      >
        <div className="lg:max-w-[54%]">
          <Eyebrow className="mb-2">{eyebrow}</Eyebrow>
          <Tag
            id={id}
            className={cn(
              "font-extrabold",
              Tag === "h1"
                ? "text-[32px] leading-[1.25] tracking-[-0.01em] sm:text-[40px] md:text-5xl md:leading-[1.5]"
                : "text-[26px] leading-[1.3] tracking-[-0.02em] sm:text-[32px] sm:leading-[1.5]",
            )}
          >
            {title}
          </Tag>
          <p className="mt-3 max-w-[660px] text-lg leading-relaxed text-[#435358] sm:text-2xl sm:leading-[1.5] lg:mt-4">
            {lead}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </Container>

      {/*
       * Photo. On desktop a mint-to-warm-grey wash runs up to its left edge
       * (the `before` layer) and the mask fades the photo in over that wash.
       */}
      <div
        className={cn(
          "relative h-[260px] sm:h-[360px]",
          "lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[46.5%] lg:max-w-[760px] lg:bg-[#d5cdc2]",
          "lg:before:absolute lg:before:inset-y-0 lg:before:right-full lg:before:w-1/2 lg:before:bg-gradient-to-r lg:before:from-mint lg:before:to-[#d5cdc2]",
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload={preload}
          sizes="(min-width: 1024px) 47vw, 100vw"
          className="object-cover object-top lg:[mask-image:linear-gradient(to_right,transparent,black_16%)]"
        />
      </div>
    </section>
  );
}
