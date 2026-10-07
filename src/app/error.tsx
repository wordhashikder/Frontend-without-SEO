"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/layout";
import { routes } from "@/lib/site";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // The digest matches the server log entry for this failure.
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center md:py-36">
      <Eyebrow className="mb-3">Something went wrong</Eyebrow>
      <h1 className="text-4xl font-extrabold tracking-[-0.01em] md:text-5xl">
        We hit a problem loading this page
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg">
        This is usually temporary. Please try again in a moment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()} size="lg">
          Try again
        </Button>
        <ButtonLink href={routes.home} variant="outline" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
