import type { Plan } from "@/lib/types";

export type PlanContent = {
  key: Plan;
  name: string;
  /** Monthly price in pounds. Billing itself is handled by Stripe. */
  price: number;
  tagline?: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

/**
 * Only a fallback. Plans, prices and perks are managed in the Dashboard (Plans & pricing) and
 * read from the API by `getPlans()` (lib/plans.ts). These values are shown only while the API
 * cannot be reached, so /join still renders; they are never what is charged.
 */
export const fallbackPlans: PlanContent[] = [
  {
    key: "free",
    name: "Free",
    price: 0,
    features: [
      "Get listed on PickASparky",
      "Show your profile on the site",
      "Appear in search results",
      "Basic business information",
    ],
    cta: "Join Free",
  },
  {
    key: "pro",
    name: "Pro",
    price: 29,
    features: [
      "Featured listing",
      "Appear at the top of the list",
      "Receive and respond to enquiries",
      "Show all your services and accreditations",
    ],
    cta: "Join Pro",
    popular: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: 49,
    features: [
      "Everything in Pro",
      "Premium support",
      "Priority visibility",
      "Early access to new features",
    ],
    cta: "Join Premium",
  },
];
