import "server-only";

import { cache } from "react";
import fallback from "@/content/site-content.json";
import { api } from "@/lib/api";
import { getPlans } from "@/lib/plans";
import { formatPrice } from "@/lib/plans-format";
import { site } from "@/lib/site";

/**
 * Editable page content (Dashboard → Website content).
 *
 * Every page reads its words here: the version the team published, or, until
 * they edit it, the original wording. `site-content.json` is that original
 * wording, exported from the API's content registry (`python -m app.content`),
 * so the types below follow the editor's fields exactly and a page still renders
 * if the API is unreachable.
 *
 * Text can contain tokens the team can use anywhere: {brand}, {email},
 * {privacy_email}, prices ({price_<plan>} for every plan, e.g. {price_free}, {price_pro},
 * {price_premium}, and {lowest_price}; they follow Plans & pricing) and, on location
 * pages, {city}.
 */

type Fallback = typeof fallback;
export type ContentKey = keyof Fallback;
export type PageContent<K extends ContentKey> = Fallback[K];

/** `{price_pro}`-style tokens for every plan, from the live plan prices. */
async function priceTokens() {
  const plans = await getPlans();
  // The original wording mentions these three; if a plan was removed its price is left blank
  // (edit the text in Dashboard > Website content) rather than showing a stale or raw token.
  const tokens: Record<string, string> = {
    price_free: "",
    price_pro: "",
    price_premium: "",
  };
  for (const plan of plans) {
    tokens[`price_${plan.key.replace(/-/g, "_")}`] =
      `${formatPrice(plan.price)} per month`;
  }
  const paid = plans.filter((plan) => plan.price > 0).map((plan) => plan.price);
  tokens.lowest_price = paid.length ? formatPrice(Math.min(...paid)) : "";
  return tokens;
}

/** Organisation details from Settings, with the built-in values as a fallback. */
export const getOrganisation = cache(async () => {
  const platform = await api.platform();
  return {
    name: platform?.platform_name || site.name,
    email: platform?.support_email || site.email,
  };
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Published content over the bundled defaults, field by field, so a field this
 * build expects is never missing (e.g. while the API runs an older version).
 */
function overlay(base: unknown, published: unknown): unknown {
  if (published === null || published === undefined) return base;
  if (isRecord(base)) {
    if (!isRecord(published)) return base;
    const merged: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(published)) {
      if (key in base) merged[key] = overlay(base[key], value);
    }
    return merged;
  }
  if (Array.isArray(base)) return Array.isArray(published) ? published : base;
  return typeof published === typeof base ? published : base;
}

function fill(value: unknown, tokens: Record<string, string>): unknown {
  if (typeof value === "string") {
    return value.replace(/\{([a-z0-9_]+)\}/g, (match, name: string) =>
      name in tokens ? tokens[name] : match,
    );
  }
  if (Array.isArray(value)) return value.map((item) => fill(item, tokens));
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, fill(item, tokens)]),
    );
  }
  return value;
}

const loadRaw = cache(async (key: ContentKey) => {
  const published = await api.content(key);
  return overlay(fallback[key], published?.content ?? null);
});

/** Site-wide content (footer, directory headings, social links...). */
export const getSiteContent = () => getContent("site");

/**
 * A page's content with tokens filled in. `vars` adds page-specific tokens,
 * e.g. `{ city: "Leeds" }` on location pages.
 */
export async function getContent<K extends ContentKey>(
  key: K,
  vars: Record<string, string> = {},
): Promise<PageContent<K>> {
  const [raw, siteRaw, organisation, prices] = await Promise.all([
    loadRaw(key),
    key === "site" ? null : loadRaw("site"),
    getOrganisation(),
    priceTokens(),
  ]);
  const siteContent = (key === "site" ? raw : siteRaw) as PageContent<"site">;
  const tokens: Record<string, string> = {
    brand: organisation.name,
    email: organisation.email,
    privacy_email: siteContent.contact.privacy_email || site.privacyEmail,
    ...prices,
    ...vars,
  };
  return fill(raw, tokens) as PageContent<K>;
}

/** The `seo` section of a page as `pageMetadata` arguments. */
export async function getSeo(key: Exclude<ContentKey, "site">) {
  const content = await getContent(key);
  return (content as { seo: { title: string; description: string } }).seo;
}
