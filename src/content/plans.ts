import type { Plan } from "@/lib/types";

export type PlanContent = {
  key: Plan;
  name: string;
  /** Monthly price in pounds. Billing itself is handled by Stripe. */
  price: number;
  features: string[];
  cta: string;
  popular?: boolean;
};

/**
 * Membership copy shown on /join and during sign-up.
 * Prices are display values: the amounts charged are the Stripe prices
 * configured on the API (STRIPE_PRICE_PRO / STRIPE_PRICE_PREMIUM). Keep them in step.
 */
export const plans: PlanContent[] = [
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

export const planByKey = (key: string | undefined) =>
  plans.find((plan) => plan.key === key);
