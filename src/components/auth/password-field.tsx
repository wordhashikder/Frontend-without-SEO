"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { describedBy, Field, Input } from "@/components/ui/form";
import {
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
} from "./password-policy";

const noop = () => () => {};

type PasswordFieldProps = {
  id: string;
  label: string;
  /** `new`: choosing a password (policy shown and enforced). `current`: signing in. */
  mode: "new" | "current";
  error?: string;
};

/** Password input with a show/hide toggle and, for new passwords, the policy hint. */
export function PasswordField({ id, label, mode, error }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  // The toggle needs JavaScript, so it only appears once the page is interactive.
  const interactive = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const hint = mode === "new" ? PASSWORD_HINT : undefined;

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <div className="relative">
        <Input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          required
          autoComplete={mode === "new" ? "new-password" : "current-password"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...(mode === "new"
            ? {
                minLength: PASSWORD_MIN_LENGTH,
                pattern: PASSWORD_PATTERN,
                title: PASSWORD_HINT,
              }
            : {})}
          className="pr-12"
          {...describedBy(id, error, hint)}
        />
        {interactive ? (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label="Show password"
            aria-pressed={visible}
            aria-controls={id}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted transition-colors hover:text-ink"
          >
            {visible ? (
              <EyeOff aria-hidden className="size-[18px]" strokeWidth={1.75} />
            ) : (
              <Eye aria-hidden className="size-[18px]" strokeWidth={1.75} />
            )}
          </button>
        ) : null}
      </div>
    </Field>
  );
}
