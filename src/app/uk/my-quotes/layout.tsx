import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { CustomerNav } from "@/components/customer/nav";
import { SignInPanel } from "@/components/customer/sign-in-panel";
import { Container } from "@/components/ui/layout";
import { getCustomerSession } from "@/lib/customer-session";

export const metadata: Metadata = {
  title: { absolute: "My Quotes | PickASparky" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Personal data: never prerendered or cached.
export const dynamic = "force-dynamic";

/**
 * The homeowner's quote dashboard. A magic link (see ./verify) starts a
 * session; without one, the visitor is offered a fresh link instead.
 */
export default async function MyQuotesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCustomerSession();
  if (!session) {
    return (
      <Suspense>
        <SignInPanel />
      </Suspense>
    );
  }
  const { overview } = session;
  const quotes = overview.requests.reduce((n, r) => n + r.quotes_received, 0);
  return (
    <div className="bg-surface">
      <Container className="grid gap-6 pt-6 pb-28 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="hidden px-3.5 pb-3 text-xs font-semibold tracking-wide text-subtle uppercase lg:block">
            Hi {overview.customer.first_name}
          </p>
          <CustomerNav
            quotes={quotes}
            unread={overview.unread_messages}
            query=""
          />
        </aside>
        <div className="min-w-0">{children}</div>
      </Container>
    </div>
  );
}
