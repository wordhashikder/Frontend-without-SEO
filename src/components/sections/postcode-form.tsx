import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/site";
import { cn, UK_POSTCODE_PATTERN } from "@/lib/utils";

type PostcodeFormProps = {
  /** `hero`: large floating bar. `inline`: compact field + button. */
  variant?: "hero" | "inline";
  buttonLabel?: string;
  /** Pre-select an installer when the form sits on a profile page. */
  installerSlug?: string;
  id?: string;
  className?: string;
};

/**
 * Starts the quote flow. A plain GET form, so it works before hydration and
 * without JavaScript: /get-quotes?postcode=M1+1AA
 */
export function PostcodeForm({
  variant = "hero",
  buttonLabel = "Get Free Quotes",
  installerSlug,
  id = "postcode",
  className,
}: PostcodeFormProps) {
  const hero = variant === "hero";
  return (
    <form
      action={routes.quotes}
      method="get"
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-line bg-white",
        hero
          ? "p-2 shadow-card sm:flex-row sm:items-center"
          : "p-1.5 shadow-soft min-[400px]:flex-row min-[400px]:items-center",
        className,
      )}
    >
      {installerSlug ? (
        <input type="hidden" name="installer" value={installerSlug} />
      ) : null}
      <label
        htmlFor={id}
        className={cn(
          "flex min-w-0 flex-1 cursor-text items-center gap-3",
          hero ? "px-4 py-2 sm:py-0 sm:pr-0" : "px-3 min-[400px]:pr-0",
        )}
      >
        <MapPin aria-hidden className="size-4 shrink-0 text-muted" />
        <span className="flex min-w-0 flex-1 flex-col">
          {hero ? (
            <span className="text-[13px] font-medium leading-tight text-ink">
              Enter your postcode
            </span>
          ) : (
            <span className="sr-only">Enter your postcode</span>
          )}
          <input
            id={id}
            name="postcode"
            type="text"
            required
            autoComplete="postal-code"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            maxLength={8}
            pattern={UK_POSTCODE_PATTERN}
            title="Enter a full UK postcode, for example M1 1AA"
            placeholder={hero ? "e.g. SW1A 1AA" : "Enter your postcode"}
            className={cn(
              "w-full min-w-0 bg-transparent text-ink uppercase placeholder:normal-case placeholder:text-subtle focus:outline-none",
              hero ? "text-[13px] leading-tight" : "h-9 text-[13px]",
            )}
          />
        </span>
      </label>
      <Button
        type="submit"
        arrow
        size={hero ? "lg" : "md"}
        className="shrink-0"
      >
        {buttonLabel}
      </Button>
    </form>
  );
}
