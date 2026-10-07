import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/layout";
import { cn } from "@/lib/utils";

/** White, softly bordered panel used by every auth and account screen. */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AuthCardProps = {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  /** Links shown under the card, e.g. "New here? Join as an installer". */
  footer?: ReactNode;
};

/** Centred single-card page: sign in, password reset, email verification. */
export function AuthCard({
  eyebrow = "Installer account",
  title,
  lead,
  children,
  footer,
}: AuthCardProps) {
  return (
    <Container className="py-12 sm:py-16 md:py-20">
      <div className="mx-auto w-full max-w-[480px]">
        <Card>
          <Eyebrow className="mb-2">{eyebrow}</Eyebrow>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[28px]">
            {title}
          </h1>
          {lead ? <p className="mt-3 text-sm leading-relaxed">{lead}</p> : null}
          <div className="mt-6">{children}</div>
        </Card>
        {footer ? (
          <div className="mt-4 text-center text-sm [&_a]:inline-block [&_a]:py-2.5">
            {footer}
          </div>
        ) : null}
      </div>
    </Container>
  );
}

/** Inline text link in the brand green, sized for body copy. */
export const textLink =
  "font-semibold text-primary underline-offset-4 hover:text-primary-dark hover:underline";
