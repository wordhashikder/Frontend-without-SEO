import type { Metadata } from "next";
import { Suspense } from "react";
import { checkPostcode } from "@/actions/quote";
import { QuoteFlow } from "@/components/quote/quote-flow";
import type { InstallerRef, QuoteEntry } from "@/components/quote/state";
import { StepNumber } from "@/components/sections/feature-blocks";
import { JsonLd } from "@/components/sections/json-ld";
import { PageSchema } from "@/components/sections/page-schema";
import { Container, Eyebrow } from "@/components/ui/layout";
import { quoteEnums } from "@/content/quote-questions";
import { api } from "@/lib/api";
import { pageMetadata, serviceSchema } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import type { InstallationType } from "@/lib/types";

const description =
  "Get up to 5 free EV charger installation quotes from vetted local installers. Enter your postcode, answer 6 short questions and compare. No obligation.";

const page = {
  title: "Get Free EV Charger Installation Quotes",
  description,
  path: routes.quotes,
};

export const metadata: Metadata = pageMetadata(page);

const howItWorks = [
  {
    title: "Answer 6 short questions",
    text: "Tell us about the charger, your property and your timing. Most answers are a single tap.",
  },
  {
    title: "Get matched locally",
    text: "We match your request with up to 5 vetted installers whose service area covers your postcode.",
  },
  {
    title: "Compare and choose",
    text: "Matched installers get in touch with their quotes. It's free, and you choose who to contact.",
  },
];

type SearchParams = PageProps<"/get-quotes">["searchParams"];

export default function GetQuotesPage({
  searchParams,
}: PageProps<"/get-quotes">) {
  return (
    <>
      {/* At least one screen tall, so the footer never crowds a short question. */}
      <section className="min-h-[calc(100svh-72px)] bg-gradient-to-b from-surface to-white">
        <Container size="narrow" className="py-8 sm:py-12 lg:py-16">
          <noscript>
            <p className="mx-auto mb-6 max-w-[640px] rounded-xl bg-peach-soft px-4 py-3 text-sm leading-relaxed text-ink">
              This form needs JavaScript to continue past the postcode step.
              Please turn JavaScript on in your browser, or email{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold underline"
              >
                {site.email}
              </a>{" "}
              and we&apos;ll help you request quotes.
            </p>
          </noscript>
          {/* The postcode check can take a moment; the page shell never waits for it. */}
          <Suspense fallback={<FlowSkeleton />}>
            <QuoteStart searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>

      <PageSchema {...page} crumb="Get Free Quotes" />
      <JsonLd
        data={serviceSchema({
          name: "Free EV charger installation quotes",
          description:
            "Free service for UK homeowners and businesses: answer 6 short questions and get matched with up to 5 vetted, local EV charger installers.",
          path: routes.quotes,
        })}
      />
    </>
  );
}

/** Reads the entry parameters and checks them before the questionnaire starts. */
async function QuoteStart({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const postcode = first(query.postcode).slice(0, 12);
  const type = first(query.type);
  const installerSlug = first(query.installer);

  const [postcodeCheck, installer] = await Promise.all([
    postcode ? checkPostcode(postcode) : null,
    installerSlug ? resolveInstaller(installerSlug) : null,
  ]);

  const entry: QuoteEntry = {
    postcode: postcodeCheck ? { value: postcode, check: postcodeCheck } : null,
    installationType: isInstallationType(type) ? type : null,
    installer,
  };

  return <QuoteFlow entry={entry} intro={<Intro />} outro={<HowItWorks />} />;
}

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

const isInstallationType = (value: string): value is InstallationType =>
  (quoteEnums.installation_type as string[]).includes(value);

/** Longest we wait to learn an installer's name before starting the flow. */
const INSTALLER_LOOKUP_TIMEOUT_MS = 4_000;

/**
 * `?installer=<slug>` from a profile page. Unknown installers, and installers
 * whose plan does not take direct requests, are ignored: the request then goes
 * to matched installers as usual.
 */
async function resolveInstaller(slug: string): Promise<InstallerRef | null> {
  if (slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }
  try {
    const installer = await Promise.race([
      api.installer(slug),
      new Promise<never>((_, reject) =>
        setTimeout(reject, INSTALLER_LOOKUP_TIMEOUT_MS),
      ),
    ]);
    if (!installer?.accepts_direct_quotes) return null;
    return { slug: installer.slug, name: installer.business_name };
  } catch {
    // API unavailable: keep the customer's choice and show a readable name.
    // The API makes the final decision when the request is sent.
    return { slug, name: nameFromSlug(slug) };
  }
}

/** "north-west-ev" -> "North West Ev" */
const nameFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function Intro() {
  return (
    <header className="mb-7 text-center sm:mb-9">
      <Eyebrow className="mb-3">Free EV charger quotes</Eyebrow>
      <h1 className="text-[30px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[40px]">
        Get free EV charger installation quotes
      </h1>
      <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-relaxed">
        Answer 6 short questions and we&apos;ll match you with up to 5 vetted,
        local installers. It&apos;s free and there&apos;s no obligation.
      </p>
    </header>
  );
}

function HowItWorks() {
  return (
    <section aria-labelledby="quote-how-heading" className="mt-12 sm:mt-16">
      <h2
        id="quote-how-heading"
        className="text-center text-xl font-bold tracking-[-0.01em] sm:text-2xl"
      >
        How getting quotes works
      </h2>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-5">
        {howItWorks.map((item, index) => (
          <li key={item.title} className="flex gap-4 sm:block">
            <StepNumber tone="mint">{index + 1}</StepNumber>
            <div>
              <h3 className="text-[15px] font-semibold leading-snug sm:mt-4">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FlowSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div
        role="status"
        className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8"
      >
        <p className="text-sm font-medium text-ink">
          Finding installers near you…
        </p>
        <div aria-hidden className="mt-5 grid gap-2.5">
          {["a", "b", "c", "d"].map((key) => (
            <div
              key={key}
              className="h-14 animate-pulse rounded-xl bg-surface"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
