import { Check } from "lucide-react";
import type { JourneyStep } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Where the request is on its way to an installed charger. */
export function Journey({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol
      className="grid gap-4 sm:grid-cols-5 sm:gap-2"
      aria-label="Installation journey"
    >
      {steps.map((step, index) => (
        <li
          key={step.key}
          aria-current={step.state === "current" ? "step" : undefined}
          className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center"
        >
          <span className="relative flex items-center sm:w-full sm:justify-center">
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 hidden h-0.5 w-full sm:block",
                  step.state === "upcoming" ? "bg-line" : "bg-primary",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                step.state === "done" && "border-primary bg-primary text-white",
                step.state === "current" &&
                  "border-primary bg-white text-primary shadow-[0_0_0_4px_var(--color-primary-soft)]",
                step.state === "upcoming" && "border-line bg-white text-subtle",
              )}
            >
              {step.state === "done" ? (
                <Check aria-hidden className="size-4" strokeWidth={3} />
              ) : (
                index + 1
              )}
            </span>
          </span>
          <span
            className={cn(
              "text-sm sm:mt-2 sm:text-xs",
              step.state === "upcoming"
                ? "text-subtle"
                : "font-semibold text-ink",
            )}
          >
            {step.label}
            <span className="sr-only">
              {step.state === "done"
                ? " (done)"
                : step.state === "current"
                  ? " (next)"
                  : ""}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
