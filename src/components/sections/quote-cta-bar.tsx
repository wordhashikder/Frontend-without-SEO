import { FileText, type LucideIcon, PoundSterling, Zap } from "lucide-react";
import { PostcodeForm } from "@/components/sections/postcode-form";
import { cn } from "@/lib/utils";

/** The three reassurances under the headline. */
const points: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Zap, title: "Trusted", text: "installers" },
  { icon: FileText, title: "Compare", text: "multiple quotes" },
  { icon: PoundSterling, title: "Free", text: "to use" },
];

type QuoteCtaBarProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  /** Prefix of the element ids, so the heading and postcode field have stable ids. */
  id?: string;
  /** Spacing around the bar, set by the page it closes. */
  className?: string;
};

/**
 * The closing "Ready to get started?" bar with the postcode field: closes installer
 * profiles and the accreditation pages, so they all ask for the quote in the same way.
 */
export function QuoteCtaBar({
  eyebrow = "Ready to get started?",
  title = "Compare up to 5 quotes from trusted EV charger installers in your area",
  lead = "It's free, fast and there's no obligation.",
  id = "quote-cta",
  className,
}: QuoteCtaBarProps) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-[#d9efe6] bg-gradient-to-r from-[#f2f9f8] via-[#f2f9f7] to-[#e9f5f1]",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 600 300"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden h-full w-[48%] text-[#e1f2ec] lg:block"
      >
        <path d="M330 0H600V300H0C70 215 215 145 330 0Z" fill="currentColor" />
      </svg>
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-center lg:gap-8 lg:px-9 lg:py-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-dark">
            {eyebrow}
          </p>
          <h2
            id={`${id}-heading`}
            className="mt-2.5 max-w-[640px] text-[24px] font-bold leading-[1.25] tracking-[-0.01em] sm:text-[28px] lg:text-[24px] xl:text-[26px]"
          >
            {title}
          </h2>
          <p className="mt-3 text-[15px]">{lead}</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-4 sm:flex-nowrap sm:gap-x-0">
            {points.map((point, index) => (
              <li
                key={point.title}
                className={cn(
                  "flex items-center gap-2.5 sm:pr-4 xl:gap-3 xl:pr-5",
                  index > 0 &&
                    "sm:border-l sm:border-[#d7efe6] sm:pl-4 xl:pl-5",
                )}
              >
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center xl:size-10 justify-center rounded-full bg-[#ddf2ea] text-primary"
                >
                  <point.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="text-[13px] leading-[1.35] whitespace-nowrap xl:text-sm">
                  <span className="block font-semibold text-ink">
                    {point.title}
                  </span>
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 40 44"
            className="pointer-events-none absolute -top-9 -right-3 hidden h-11 w-10 text-primary lg:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M9 4 6 17" />
            <path d="M32 14 21 22" />
            <path d="M36 30 27 31" />
          </svg>
          <PostcodeForm
            id={`${id}-postcode`}
            variant="inline"
            large
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
