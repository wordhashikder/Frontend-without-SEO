import { type LucideIcon, MoveRight } from "lucide-react";
import type { ReactNode } from "react";
import { StepNumber } from "@/components/sections/feature-blocks";
import { CheckBullet } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";

export type FlowStep = {
  icon: LucideIcon;
  title: string;
  text: string;
  /** Background of the number chip; the design varies it per card. */
  chipClassName?: string;
};

type StepFlowProps = {
  steps: FlowStep[];
  /** Card surface: white on the mint band, stone on the white band. */
  tone?: "white" | "stone";
  className?: string;
};

/**
 * Numbered step cards joined by arrows. An ordered list, so the sequence is
 * announced to screen readers; the arrows are decoration and disappear when
 * the cards no longer sit far enough apart to need them.
 */
export function StepFlow({ steps, tone = "white", className }: StepFlowProps) {
  return (
    <ol
      className={cn(
        "grid gap-4 md:grid-cols-3 md:gap-5 lg:gap-20 xl:gap-[130px]",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          key={step.title}
          className={cn(
            "relative rounded-2xl p-4 pt-8",
            tone === "white" ? "bg-white" : "bg-stone",
          )}
        >
          <div className="flex items-center gap-3">
            <StepNumber className={step.chipClassName}>{index + 1}</StepNumber>
            <step.icon
              aria-hidden
              className="size-9 text-ink"
              strokeWidth={1.75}
            />
          </div>
          <h3 className="mt-8 text-[22px] font-extrabold leading-9 sm:mt-11 sm:text-2xl sm:leading-10">
            {step.title}
          </h3>
          <p className="mt-3 text-sm leading-5 sm:mt-5">{step.text}</p>
          {index < steps.length - 1 ? (
            <span
              aria-hidden
              className="absolute top-[42px] left-full hidden w-20 justify-center text-ink lg:flex xl:w-[130px]"
            >
              <MoveRight className="size-10" strokeWidth={1.75} />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

type FlowActionsProps = {
  /** The call-to-action button. */
  children: ReactNode;
  claims: string[];
};

/** Button followed by the row of green-tick claims that closes each flow. */
export function FlowActions({ children, claims }: FlowActionsProps) {
  return (
    <div className="mt-10 flex flex-col gap-x-8 gap-y-6 sm:mt-12 lg:flex-row lg:items-center">
      <div>{children}</div>
      <ul className="flex flex-col gap-x-7 gap-y-3 sm:flex-row sm:flex-wrap">
        {claims.map((claim) => (
          <li
            key={claim}
            className="flex items-center gap-2 text-sm font-semibold text-ink"
          >
            <CheckBullet />
            {claim}
          </li>
        ))}
      </ul>
    </div>
  );
}
