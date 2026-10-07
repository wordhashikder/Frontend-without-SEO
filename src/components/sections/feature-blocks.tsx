import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { IconBadge, ShieldTick } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";

type BadgeTone = ComponentProps<typeof IconBadge>["tone"];

const cardTones = {
  outline: "border border-line bg-white shadow-soft",
  mint: "bg-mint",
  peach: "bg-peach",
  sand: "bg-sand",
  white: "bg-white",
} as const;

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  text: string;
  tone?: keyof typeof cardTones;
  iconTone?: BadgeTone;
  /** Icon on the left of the text instead of above it. */
  inline?: boolean;
  className?: string;
};

/** Icon + heading + short text in a card. Bordered or tinted. */
export function FeatureCard({
  icon,
  title,
  text,
  tone = "outline",
  iconTone = "mint",
  inline,
  className,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        "h-full rounded-2xl p-5 sm:p-6",
        cardTones[tone],
        inline && "flex gap-4",
        className,
      )}
    >
      <IconBadge icon={icon} tone={iconTone} size={inline ? "md" : "lg"} />
      <div>
        <h3
          className={cn(
            "text-lg font-extrabold leading-snug tracking-[-0.01em] sm:text-xl",
            !inline && "mt-6",
          )}
        >
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed">{text}</p>
      </div>
    </article>
  );
}

type IconColumnsProps = {
  items: { icon: LucideIcon; title: string; text: string; tone?: BadgeTone }[];
  className?: string;
};

/** Centred icon columns separated by hairlines (2 per row on mobile). */
export function IconColumns({ items, className }: IconColumnsProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))] lg:divide-x lg:divide-line",
        className,
      )}
      style={{ "--cols": items.length } as React.CSSProperties}
    >
      {items.map((item) => (
        <li key={item.title} className="px-3 text-center sm:px-5">
          <IconBadge icon={item.icon} tone={item.tone ?? "mint"} size="lg" />
          <h3 className="mt-5 text-base font-extrabold leading-snug tracking-[-0.01em] sm:text-lg">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Mint highlight card with the shield tick ("Our commitment", "Use a qualified electrician"). */
export function Callout({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex gap-4 rounded-2xl bg-mint-soft p-6 sm:gap-5",
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-mint sm:size-[100px]"
      >
        <ShieldTick className="size-9 sm:size-14" />
      </span>
      <div className="pt-1 sm:pt-2">
        <h2 className="text-xl font-extrabold leading-snug tracking-[-0.01em] sm:text-[28px]">
          {title}
        </h2>
        <div className="mt-2 text-[15px] leading-relaxed sm:text-base">
          {children}
        </div>
      </div>
    </aside>
  );
}

/** Numbered chip for step sequences. */
export function StepNumber({
  children,
  tone = "peach",
  className,
}: {
  children: ReactNode;
  tone?: "peach" | "mint" | "sand" | "green";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-base font-semibold text-ink",
        tone === "peach" && "bg-peach",
        tone === "mint" && "bg-mint",
        tone === "sand" && "bg-sand",
        tone === "green" && "bg-primary text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}
