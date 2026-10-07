import { Plus } from "lucide-react";
import { JsonLd } from "@/components/sections/json-ld";
import { faqSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type FaqItem = { question: string; answer: string };

type FaqListProps = {
  items: FaqItem[];
  /** Two columns on desktop (installer landing page). */
  columns?: 1 | 2;
  /** Emit FAQPage structured data. Use once per page. */
  withSchema?: boolean;
  className?: string;
};

/**
 * Accessible accordion built on native <details>: works without JavaScript,
 * is keyboard operable, and answers stay in the HTML for search and AI crawlers.
 */
export function FaqList({
  items,
  columns = 1,
  withSchema = false,
  className,
}: FaqListProps) {
  return (
    <>
      <div
        className={cn(
          "grid gap-3",
          columns === 2 && "md:grid-cols-2 md:gap-x-6",
          className,
        )}
      >
        {items.map((item) => (
          <details
            key={item.question}
            className="group h-fit rounded-lg border border-line bg-white shadow-soft"
          >
            <summary className="flex items-center justify-between gap-4 px-4 py-3.5 text-[13px] font-semibold text-ink sm:px-5 sm:text-sm">
              <h3 className="font-semibold">{item.question}</h3>
              <Plus
                aria-hidden
                className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-45"
                strokeWidth={1.75}
              />
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed sm:px-5">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
      {withSchema ? <JsonLd data={faqSchema(items)} /> : null}
    </>
  );
}
