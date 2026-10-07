"use client";

import { type ReactNode, useRef } from "react";
import type { Option } from "@/content/quote-questions";
import { cn } from "@/lib/utils";

/** Shared look of a selectable answer row (radio cards and the vehicle checkbox). */
export const optionCardClass =
  "flex min-h-14 cursor-pointer items-center gap-3.5 rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-medium leading-snug text-ink transition-colors duration-150 select-none hover:border-primary/60 has-[:checked]:border-primary has-[:checked]:bg-mint-soft has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-primary)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary";

/** Native radio restyled as a ring that fills green when chosen. */
export const optionRadioClass =
  "size-5 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-[#b4bfca] bg-white transition-[border-width,border-color] duration-150 checked:border-[6px] checked:border-primary focus-visible:outline-none";

/** A tap counts as "by pointer" if the press happened this recently (ms). */
const POINTER_WINDOW_MS = 1_500;

type OptionCardsProps<T extends string> = {
  /** The question. Rendered as the fieldset's legend. */
  legend: ReactNode;
  name: string;
  options: readonly Option<T>[];
  value: T | "";
  /** Selection changed (pointer or keyboard). */
  onSelect: (value: T) => void;
  /**
   * An option was chosen by tap or click, so the flow may move on by itself.
   * Not called for keyboard selection: arrow keys only move the selection, and
   * Enter (or the Next button) confirms it.
   */
  onCommit?: (value: T) => void;
  error?: string;
  className?: string;
};

/** A group of large radio cards: real radio inputs inside labels. */
export function OptionCards<T extends string>({
  legend,
  name,
  options,
  value,
  onSelect,
  onCommit,
  error,
  className,
}: OptionCardsProps<T>) {
  const pointerAt = useRef(0);
  const errorId = `${name}-error`;

  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      className={cn("min-w-0", className)}
    >
      <legend className="mb-5 block w-full p-0 sm:mb-6">{legend}</legend>
      <div className="grid gap-2.5">
        {options.map((option) => (
          <label
            key={option.value}
            className={optionCardClass}
            onPointerDown={() => {
              pointerAt.current = Date.now();
            }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onSelect(option.value)}
              onClick={() => {
                // Also fires for an already-selected card, so going back and
                // tapping the same answer still moves forward.
                if (Date.now() - pointerAt.current < POINTER_WINDOW_MS) {
                  pointerAt.current = 0;
                  onCommit?.(option.value);
                }
              }}
              className={optionRadioClass}
            />
            <span className="min-w-0 flex-1">{option.label}</span>
          </label>
        ))}
      </div>
      <p
        id={errorId}
        aria-live="polite"
        className={cn("text-sm text-red-600", error ? "mt-3" : "sr-only")}
      >
        {error}
      </p>
    </fieldset>
  );
}
