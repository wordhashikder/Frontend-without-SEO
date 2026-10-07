import { Check, Lock } from "lucide-react";
import type { Metadata } from "next";
import { Card } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { StepNumber } from "@/components/sections/feature-blocks";
import { Container, Eyebrow } from "@/components/ui/layout";
import { planByKey, plans } from "@/content/plans";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import type { Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Create Your Installer Account",
  description:
    "Create a PickASparky installer account: add your business details, choose a Free, Pro or Premium plan and verify your email to start your listing review.",
  path: routes.register,
  index: false,
});

const steps = [
  {
    title: "Verify your email",
    text: "We'll send you a link to confirm your email address.",
  },
  {
    title: "We review your business details",
    text: "We'll email you as soon as your listing has been reviewed.",
  },
  {
    title: "Your listing goes live",
    text: "Homeowners in your area can find your business on PickASparky.",
  },
];

/*
 * The summary follows the plan radio in the form without any JavaScript:
 * each block is shown while its radio (#plan-free, #plan-pro, #plan-premium,
 * rendered by RegisterForm) is checked. Class names are written out in full
 * so Tailwind can see them.
 */
const showForPlan: Record<Plan, string> = {
  free: "group-has-[#plan-free:checked]/register:block",
  pro: "group-has-[#plan-pro:checked]/register:block",
  premium: "group-has-[#plan-premium:checked]/register:block",
};
const showForPaidPlan =
  "group-has-[#plan-pro:checked]/register:flex group-has-[#plan-premium:checked]/register:flex";

export default async function RegisterPage({
  searchParams,
}: PageProps<"/join/register">) {
  const { plan } = await searchParams;
  const initialPlan =
    planByKey(typeof plan === "string" ? plan : undefined)?.key ?? "free";

  return (
    <div className="bg-surface">
      <Container className="py-10 sm:py-14 md:py-16">
        <div className="group/register grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12">
          <Card>
            <RegisterForm initialPlan={initialPlan} />
          </Card>

          <aside
            aria-label="What happens after you sign up"
            className="lg:sticky lg:top-24 lg:pt-8"
          >
            <Eyebrow className="mb-2">What happens next</Eyebrow>
            <h2 className="text-xl font-extrabold tracking-[-0.01em] sm:text-2xl">
              Three steps to your listing
            </h2>
            <ol className="mt-6 space-y-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <StepNumber tone="mint">{index + 1}</StepNumber>
                  <div>
                    <h3 className="text-[15px] font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p
              className={cn(
                "mt-6 hidden gap-3 rounded-xl bg-mint-soft p-4 text-sm leading-relaxed",
                showForPaidPlan,
              )}
            >
              <Lock
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-primary"
                strokeWidth={1.75}
              />
              <span>
                <span className="font-semibold text-ink">
                  No payment is taken today.
                </span>{" "}
                For a paid plan, you&apos;ll be taken to secure Stripe checkout
                from your account after you sign in.
              </span>
            </p>

            {plans.map((item) => (
              <section
                key={item.key}
                aria-labelledby={`summary-${item.key}`}
                className={cn(
                  "mt-6 hidden rounded-2xl border border-line bg-white p-6 shadow-soft",
                  showForPlan[item.key],
                )}
              >
                <h3
                  id={`summary-${item.key}`}
                  className="text-lg font-bold tracking-[-0.01em]"
                >
                  {item.name} plan
                </h3>
                <p className="mt-1 flex items-baseline gap-2 text-ink">
                  <span className="text-[28px] font-extrabold tracking-[-0.02em]">
                    £{item.price}
                  </span>
                  <span className="text-sm text-muted">/ month</span>
                </p>
                <ul className="mt-4 space-y-3 text-sm text-ink">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        strokeWidth={2}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed">
                  {item.key === "free"
                    ? "You can upgrade from your account at any time."
                    : "Payments are handled by Stripe. No long\u2011term contracts."}
                </p>
              </section>
            ))}
          </aside>
        </div>
      </Container>
    </div>
  );
}
