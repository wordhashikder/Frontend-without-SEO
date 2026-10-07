import Image from "next/image";
import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/layout";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Decorative illustration shown to the right on desktop. */
  image?: { src: string; width: number; height: number; className?: string };
  /** Replaces the illustration, e.g. a highlight card. */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Standard opening block for content pages: eyebrow, h1, lead, optional art. */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  aside,
  children,
  className,
}: PageHeroProps) {
  const hasAside = Boolean(image || aside);
  return (
    <section className={cn("pt-12 pb-10 md:pt-20 md:pb-14", className)}>
      <Container
        className={cn(
          hasAside &&
            "grid items-center gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16",
        )}
      >
        <div>
          <Eyebrow className="mb-2">{eyebrow}</Eyebrow>
          <h1 className="text-[32px] font-extrabold leading-[1.25] tracking-[-0.01em] sm:text-[40px] md:text-5xl md:leading-[1.45]">
            {title}
          </h1>
          {lead ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed sm:text-xl sm:leading-[1.6]">
              {lead}
            </p>
          ) : null}
          {children}
        </div>
        {image ? (
          <Image
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            priority
            className={cn(
              "mx-auto h-auto w-full max-w-[240px] lg:max-w-[320px]",
              image.className,
            )}
          />
        ) : null}
        {aside}
      </Container>
    </section>
  );
}
