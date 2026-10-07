"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  type BillingState,
  openBillingPortal,
  startCheckout,
} from "@/actions/billing";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";

const initialState: BillingState = { ok: false };

type PaidPlan = { key: "pro" | "premium"; name: string; price: number };

/** One button per paid plan; the pressed button's value names the plan. */
function UpgradeButton({
  plan,
  primary,
}: {
  plan: PaidPlan;
  primary: boolean;
}) {
  const { pending, data } = useFormStatus();
  const chosen = pending && data?.get("plan") === plan.key;
  return (
    <Button
      type="submit"
      name="plan"
      value={plan.key}
      disabled={pending}
      variant={primary ? "primary" : "outline"}
      fullWidth
      className="h-auto min-h-11 whitespace-normal py-2.5"
    >
      {chosen
        ? "Opening secure checkout…"
        : `Upgrade to ${plan.name} £${plan.price}/month`}
    </Button>
  );
}

/** Starts Stripe Checkout for Pro or Premium. */
export function UpgradeActions({ plans }: { plans: PaidPlan[] }) {
  const [state, action] = useActionState(startCheckout, initialState);
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      <div className="grid gap-3">
        {plans.map((plan, index) => (
          <UpgradeButton key={plan.key} plan={plan} primary={index === 0} />
        ))}
      </div>
    </form>
  );
}

/** Opens the Stripe billing portal (payment method, invoices, cancellation). */
export function PortalAction({ label }: { label: string }) {
  const [state, action] = useActionState(openBillingPortal, initialState);
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      <SubmitButton fullWidth arrow pendingLabel="Opening billing…">
        {label}
      </SubmitButton>
    </form>
  );
}
