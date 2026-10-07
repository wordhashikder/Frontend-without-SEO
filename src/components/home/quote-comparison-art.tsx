import { Home, Leaf, Recycle, Smartphone, Zap } from "lucide-react";
import { CheckBullet } from "@/components/ui/icon-badge";
import { StarRating } from "@/components/ui/star-rating";

// Illustrative sample rows for the "compare quotes" graphic. Not real listings.
const sample = [
  { name: "GreenCharge Electrical", price: "£850", icon: Leaf },
  { name: "VoltPro Installations", price: "£920", icon: Zap },
  { name: "EcoWatt Solutions", price: "£1,050", icon: Recycle },
  { name: "Sparky Ltd", price: "£1,200", icon: Home },
  { name: "EV Experts", price: "£1,350", icon: Smartphone },
];

/** Decorative mock of a quote comparison list (hidden from assistive tech). */
export function QuoteComparisonArt() {
  return (
    <div aria-hidden className="relative max-w-[412px] select-none">
      <ul className="divide-y divide-line rounded-2xl bg-white px-4 py-2 shadow-card">
        {sample.map(({ name, price, icon: Icon }) => (
          <li key={name} className="flex items-center gap-3 py-2.5">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-forest">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-ink">
                {name}
              </span>
              <StarRating rating={5} size="sm" className="mt-0.5" />
            </span>
            <span className="text-sm font-bold text-ink">{price}</span>
            <span className="hidden rounded-full border border-primary px-3 py-1 text-[11px] font-semibold text-primary min-[400px]:inline">
              View Quote
            </span>
          </li>
        ))}
      </ul>
      <div className="absolute -right-2 -bottom-4 flex flex-col items-center gap-2 rounded-xl bg-white px-4 py-4 shadow-float sm:-right-10">
        <CheckBullet className="size-6" />
        <span className="text-sm font-semibold text-ink">Up to 5 quotes</span>
      </div>
    </div>
  );
}
