import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/layout";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-24 text-center md:py-36">
      <Eyebrow className="mb-3">404</Eyebrow>
      <h1 className="text-4xl font-extrabold tracking-[-0.01em] md:text-5xl">
        We can&apos;t find that page
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg">
        The page may have moved, or the link may be out of date. You can head
        home or start a free quote request.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href={routes.quotes} arrow size="lg">
          Get Free Quotes
        </ButtonLink>
        <ButtonLink href={routes.home} variant="outline" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
