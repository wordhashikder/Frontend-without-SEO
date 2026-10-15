"use client";

import { useActionState } from "react";
import {
  type CustomerActionState,
  updateCustomerDetails,
} from "@/actions/customer";
import { SubmitButton } from "@/components/auth/submit-button";
import { describedBy, Field, FormMessage, Input } from "@/components/ui/form";
import type { Customer } from "@/lib/types";

const initialState: CustomerActionState = { ok: false };

export function DetailsForm({ customer }: { customer: Customer }) {
  const [state, action] = useActionState(updateCustomerDetails, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field
        label="Email address"
        htmlFor="detail-email"
        hint="This is where your links and quotes are sent."
      >
        <Input id="detail-email" value={customer.email} readOnly disabled />
      </Field>
      <Field label="First name" htmlFor="detail-name" error={errors.first_name}>
        <Input
          id="detail-name"
          name="first_name"
          defaultValue={customer.first_name}
          autoComplete="given-name"
          required
          {...describedBy("detail-name", errors.first_name)}
        />
      </Field>
      <Field label="Phone" htmlFor="detail-phone" optional error={errors.phone}>
        <Input
          id="detail-phone"
          name="phone"
          type="tel"
          defaultValue={customer.phone ?? ""}
          autoComplete="tel"
          {...describedBy("detail-phone", errors.phone)}
        />
      </Field>
      {state.message ? (
        <FormMessage tone={state.ok ? "success" : "error"}>
          {state.message}
        </FormMessage>
      ) : null}
      <SubmitButton pendingLabel="Saving…">Save details</SubmitButton>
    </form>
  );
}
