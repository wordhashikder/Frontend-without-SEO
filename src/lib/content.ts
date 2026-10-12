import "server-only";

import { cache } from "react";
import { plans } from "@/content/plans";
import fallback from "@/content/site-content.json";
import { api } from "@/lib/api";
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
 * {privacy_email}, prices ({price_free}, {price_pro}, {price_premium},
 * {lowest_price}) and, on location pages, {city}.
 */

type Fallback = typeof fallback;
export type ContentKey = keyof Fallback;
export type PageContent<K extends ContentKey> = Fallback[K];

const pricePerMonth = (key: string) => {
  const plan = plans.find((item) => item.key === key);
  return plan ? `£${plan.price} per month` : "";
};
const lowestPaidPrice = Math.min(
  ...plans.filter((plan) => plan.price > 0).map((plan) => plan.price),
);

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
    return value.replace(/\{([a-z_]+)\}/g, (match, name: string) =>
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
  const [raw, siteRaw, organisation] = await Promise.all([
    loadRaw(key),
    key === "site" ? null : loadRaw("site"),
    getOrganisation(),
  ]);
  const siteContent = (key === "site" ? raw : siteRaw) as PageContent<"site">;
  const tokens: Record<string, string> = {
    brand: organisation.name,
    email: organisation.email,
    privacy_email: siteContent.contact.privacy_email || site.privacyEmail,
    price_free: pricePerMonth("free"),
    price_pro: pricePerMonth("pro"),
    price_premium: pricePerMonth("premium"),
    lowest_price: `£${lowestPaidPrice}`,
    ...vars,
  };
  return fill(raw, tokens) as PageContent<K>;
}

/** The `seo` section of a page as `pageMetadata` arguments. */
export async function getSeo(key: Exclude<ContentKey, "site">) {
  const content = await getContent(key);
  return (content as { seo: { title: string; description: string } }).seo;
}
