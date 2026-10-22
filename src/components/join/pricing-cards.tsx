import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { PlanContent } from "@/content/plans";
import { getPlans } from "@/lib/plans";
import { formatPrice } from "@/lib/plans-format";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

function PlanCard({ plan }: { plan: PlanContent }) {
  return (
    <li
      className={cn(
        "relative flex flex-col rounded-2xl bg-white p-6 lg:p-8",
        plan.popular
          ? "border-2 border-primary shadow-card"
          : "border border-line shadow-soft",
      )}
    >
      {plan.popular ? (
        <p className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-[11px] font-bold uppercase leading-4 tracking-[0.05em] text-white">
          Most popular
        </p>
      ) : null}
      <h3 className="text-xl font-bold leading-7">{plan.name}</h3>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-[30px] font-extrabold leading-10 text-ink">
          {formatPrice(plan.price)}
        </span>
        <span className="text-[15px]">/ month</span>
      </p>
      {plan.tagline ? <p className="mt-2 text-[13px]">{plan.tagline}</p> : null}
      <ul className="mt-5 mb-7 space-y-3 text-[13px] leading-[18px] text-slate-600 lg:text-xs lg:leading-[18px]">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <Check
              aria-hidden
              className="mt-px size-4 shrink-0 text-primary"
              strokeWidth={2}
            />
            {feature}
          </li>
        ))}
      </ul>
      <ButtonLink
        href={`${routes.register}?plan=${plan.key}`}
        variant={plan.popular ? "primary" : "outline"}
        size="sm"
        fullWidth
        className={cn(
          "mt-auto h-10 rounded-full text-xs",
          !plan.popular && "border-[#cdd2d9]",
        )}
      >
        {plan.cta}
      </ButtonLink>
    </li>
  );
}

/** Membership cards for /join, built from the live plans (Dashboard > Plans & pricing). */
export async function PricingCards({ className }: { className?: string }) {
  const plans = await getPlans();
  return (
    <ul
      className={cn(
        "grid gap-6",
        plans.length === 1 && "mx-auto max-w-sm",
        plans.length === 2 && "md:grid-cols-2",
        plans.length === 3 && "md:grid-cols-3",
        plans.length >= 4 && "md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {plans.map((plan) => (
        <PlanCard key={plan.key} plan={plan} />
      ))}
    </ul>
  );
}
