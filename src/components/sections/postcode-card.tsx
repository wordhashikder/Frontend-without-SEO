import { CircleCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { postcodeStep } from "@/content/quote-questions";
import { routes } from "@/lib/site";
import { cn, UK_POSTCODE_PATTERN } from "@/lib/utils";

const promises = [
  "Free, no obligation",
  "Up to 5 quotes",
  "You choose who to contact",
] as const;

type PostcodeCardProps = {
  id?: string;
  buttonLabel?: string;
  className?: string;
};

/**
 * "What's your postcode?": the card that starts the quote flow, styled like
 * the first step of /get-quotes so the two feel like one journey. A plain GET
 * form (/get-quotes?postcode=M1+1AA), so it works before hydration and
 * without JavaScript; the quote flow validates the postcode on arrival.
 */
export function PostcodeCard({
  id = "postcode-card",
  buttonLabel = "Get Free Quotes",
  className,
}: PostcodeCardProps) {
  return (
    <div className={cn("text-left", className)}>
      <form
        action={routes.quotes}
        method="get"
        aria-labelledby={`${id}-title`}
        className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8"
      >
        <h2
          id={`${id}-title`}
          className="text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-ink sm:text-[28px]"
        >
          <label htmlFor={id}>{postcodeStep.title}</label>
        </h2>
        <p className="mt-2 text-sm leading-relaxed">
          We use it to find installers whose service area covers your address.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <MapPin
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted"
              strokeWidth={1.75}
            />
            <Input
              id={id}
              name="postcode"
              type="text"
              required
              autoComplete="postal-code"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="go"
              inputMode="text"
              maxLength={8}
              pattern={UK_POSTCODE_PATTERN}
              title="Enter a full UK postcode, for example M1 1AA"
              placeholder={postcodeStep.placeholder}
              className="h-[52px] pl-11 text-base font-medium uppercase placeholder:font-normal placeholder:normal-case"
            />
          </div>
          <Button type="submit" size="lg" arrow className="shrink-0">
            {buttonLabel}
          </Button>
        </div>
      </form>
      <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px]">
        {promises.map((text) => (
          <li key={text} className="flex items-center gap-1.5">
            <CircleCheck
              aria-hidden
              className="size-4 text-primary"
              strokeWidth={1.75}
            />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
