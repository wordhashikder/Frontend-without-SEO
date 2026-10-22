import "server-only";

import { cache } from "react";
import { fallbackPlans, type PlanContent } from "@/content/plans";
import { api } from "@/lib/api";

/**
 * The membership plans on sale, in display order, with their live prices.
 * They come from the API (managed in Dashboard → Plans & pricing); the bundled copy is
 * used only if the API cannot be reached, so the pages still render.
 */
export const getPlans = cache(async (): Promise<PlanContent[]> => {
  const published = await api.plans();
  if (!published || published.length === 0) return fallbackPlans;
  return [...published]
    .sort((a, b) => a.sort_rank - b.sort_rank)
    .map((plan) => ({
      key: plan.key,
      name: plan.name,
      price: (plan.price_pence ?? 0) / 100,
      tagline: plan.tagline ?? undefined,
      features: plan.features,
      cta: `Join ${plan.name}`,
      popular: plan.is_popular || undefined,
    }));
});

/** The plan with this key, if it is on sale. */
export const findPlan = (plans: PlanContent[], key: string | undefined) =>
  plans.find((plan) => plan.key === key);
