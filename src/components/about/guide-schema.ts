import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * schema.org `Article` for the evergreen guide pages. Publication dates are
 * left out on purpose: we only state facts we actually have.
 */
export function guideArticleSchema(args: {
  headline: string;
  description: string;
  path: string;
  /** Site-relative path of the page's lead image. */
  image: string;
  /** Subjects the guide explains, e.g. scheme or regulation names. */
  about: string[];
}): Record<string, unknown> {
  const url = absoluteUrl(args.path);
  const organization = { "@id": `${site.url}/#organization` };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.headline,
    description: args.description,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(args.image),
    inLanguage: "en-GB",
    author: organization,
    publisher: organization,
    isPartOf: { "@id": `${site.url}/#website` },
    about: args.about.map((name) => ({ "@type": "Thing", name })),
  };
}
