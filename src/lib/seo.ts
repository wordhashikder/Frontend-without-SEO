import type { Metadata } from "next";
import { routes, site } from "@/lib/site";

/**
 * Canonical form of a site path: pages end with a slash, files do not
 * (the same rule as `trailingSlash` in next.config.ts).
 */
function canonicalPath(path: string) {
  const [, pathname = "/", suffix = ""] = /^([^?#]*)(.*)$/.exec(path) ?? [];
  const rooted = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isFile = /\.[a-z0-9]+$/i.test(rooted);
  return `${rooted.endsWith("/") || isFile ? rooted : `${rooted}/`}${suffix}`;
}

/** Absolute, canonical URL for a site path. */
export const absoluteUrl = (path = "/") => `${site.url}${canonicalPath(path)}`;

/**
 * Identifier of a structured-data entity (organisation, a page, its breadcrumb...), used
 * wherever the entity is referred to. A URN rather than a URL, so it has no `#` and is not
 * a link anything could follow.
 */
export const entityId = (kind: string, path?: string) =>
  `urn:pickasparky:${kind}${path === undefined ? "" : `:${canonicalPath(path)}`}`;

type PageMeta = {
  title: string;
  description: string;
  path: string;
  /** Set false for utility pages (login, account, form confirmations). */
  index?: boolean;
  /**
   * The title is complete as written, so no " | PickASparky" is added to it. Left out, a
   * title that already names the brand counts as complete; any other title gets the suffix.
   */
  standalone?: boolean;
  /** For a page kept out of the index: still let search engines follow its links. */
  followLinks?: boolean;
};

/**
 * Consistent title, description, canonical and social tags for a page. The browser tab,
 * Open Graph and Twitter titles always read the same, with the brand named once.
 */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  standalone = title.toLowerCase().includes(site.name.toLowerCase()),
  followLinks = false,
}: PageMeta): Metadata {
  const fullTitle = standalone ? title : `${title} | ${site.name}`;
  return {
    title: standalone ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      url: absoluteUrl(path),
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(index ? {} : { robots: { index: false, follow: followLinks } }),
  };
}

/*
 * schema.org builders. Search engines and AI answer engines both read these,
 * so every claim here must be backed by content visible on the page.
 */

type Json = Record<string, unknown>;

export function organizationSchema(): Json {
  const sameAs = [site.social.x, site.social.linkedin].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": entityId("organization"),
    name: site.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    description: site.description,
    email: site.email,
    areaServed: { "@type": "Country", name: "United Kingdom" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.email,
      areaServed: "GB",
      availableLanguage: "English",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": entityId("website"),
    name: site.name,
    url: absoluteUrl("/"),
    inLanguage: "en-GB",
    publisher: { "@id": entityId("organization") },
  };
}

export type WebPageType =
  | "WebPage"
  | "AboutPage"
  | "ContactPage"
  | "FAQPage"
  | "CollectionPage"
  | "SearchResultsPage"
  | "ProfilePage";

/**
 * The page itself as a `WebPage` (or a more specific subtype), tied to the
 * site and the organisation by `@id`, and to its breadcrumb trail when it shows
 * one: the pages that render `<Breadcrumbs>` publish a BreadcrumbList with the
 * matching `@id`.
 */
export function webPageSchema(args: {
  type?: WebPageType;
  title: string;
  description: string;
  path: string;
  /**
   * Link the page to its BreadcrumbList. Only pages that show a breadcrumb trail (and
   * publish its schema with `<Breadcrumbs>`) should; the default follows the homepage rule.
   */
  breadcrumb?: boolean;
  /** Extra properties for the node, e.g. `mainEntity`. */
  extra?: Json;
}): Json {
  const url = absoluteUrl(args.path);
  return {
    "@context": "https://schema.org",
    "@type": args.type ?? "WebPage",
    "@id": entityId("webpage", args.path),
    url,
    name: args.title,
    description: args.description,
    inLanguage: "en-GB",
    isPartOf: { "@id": entityId("website") },
    publisher: { "@id": entityId("organization") },
    ...((args.breadcrumb ?? args.path !== "/")
      ? { breadcrumb: { "@id": breadcrumbId(args.path) } }
      : {}),
    ...args.extra,
  };
}

/** `@id` of a page's BreadcrumbList, so its WebPage node can point at it. */
const breadcrumbId = (path: string) => entityId("breadcrumb", path);

/** The trail to a page; the last item is the page itself. */
export function breadcrumbSchema(
  items: { name: string; path: string }[],
): Json {
  const current = items.at(-1);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(current ? { "@id": breadcrumbId(current.path) } : {}),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Questions and answers as schema.org `Question` nodes. */
export function faqEntities(
  items: { question: string; answer: string }[],
): Json[] {
  return items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  }));
}

/** A FAQ block inside a page that is not itself a FAQ page. */
export function faqSchema(items: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntities(items),
  };
}

export function howToSchema(args: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: args.name,
    description: args.description,
    step: args.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function serviceSchema(args: {
  name: string;
  description: string;
  path: string;
  areaServed?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: args.name,
    description: args.description,
    url: absoluteUrl(args.path),
    serviceType: "EV charger installation quotes",
    provider: { "@id": entityId("organization") },
    areaServed: args.areaServed
      ? { "@type": "City", name: args.areaServed }
      : { "@type": "Country", name: "United Kingdom" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
      description: "Free, no-obligation quote comparison for homeowners",
    },
  };
}

/**
 * An installer's public profile as an `Electrician` (LocalBusiness subtype).
 * `aggregateRating` and `review` are emitted only for verified reviews, the ones a
 * customer wrote from a review invitation after a job. Reviews the team adds by hand
 * stay visible on the page but are never given to search engines (Google's review
 * rules ask for ratings that come directly from users).
 */
export function installerSchema(args: {
  name: string;
  path: string;
  town: string;
  description?: string | null;
  /** Logo: a site-relative path or an absolute URL. */
  image?: string | null;
  areasServed?: string[];
  /** The rating from verified reviews only (not the rating the page displays). */
  rating?: { average: number | null; count: number };
  /** The reviews rendered on the page; only the verified ones are emitted. */
  reviews?: {
    rating: number;
    title: string;
    body: string;
    author_name: string;
    created_at: string;
    verified: boolean;
  }[];
}): Json {
  const url = absoluteUrl(args.path);
  const areas = args.areasServed ?? [];
  const reviews = (args.reviews ?? []).filter((review) => review.verified);
  const hasRating =
    args.rating !== undefined &&
    args.rating.average !== null &&
    args.rating.count > 0;
  return {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": entityId("business", args.path),
    name: args.name,
    url,
    ...(args.description ? { description: args.description } : {}),
    ...(args.image
      ? {
          image: args.image.startsWith("/")
            ? absoluteUrl(args.image)
            : args.image,
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: args.town,
      addressCountry: "GB",
    },
    ...(areas.length
      ? { areaServed: areas.map((name) => ({ "@type": "Place", name })) }
      : {}),
    ...(hasRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: args.rating?.average,
            reviewCount: args.rating?.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews.length
      ? {
          review: reviews.map((review) => ({
            "@type": "Review",
            name: review.title,
            reviewBody: review.body,
            datePublished: review.created_at,
            author: { "@type": "Person", name: review.author_name },
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
  };
}

/** `@id` of the blog as a whole, shared by the listing and every article. */
const blogId = () => entityId("blog");

/** Absolute URL for an image given as a site path or an absolute URL. */
const imageUrl = (image: string) =>
  image.startsWith("/") ? absoluteUrl(image) : image;

/** The team byline is the organisation itself; any other name is a person. */
const authorNode = (name: string) =>
  name === `${site.name} Team`
    ? { "@id": entityId("organization") }
    : { "@type": "Person", name };

type PostSummary = {
  title: string;
  path: string;
  publishedAt: string;
  image?: string | null;
};

/** The blog listing's main entity (nested in its page node): a `Blog` with the posts shown. */
export function blogSchema(posts: PostSummary[]): Json {
  return {
    "@type": "Blog",
    "@id": blogId(),
    name: `${site.name} Blog`,
    url: absoluteUrl(routes.blog),
    inLanguage: "en-GB",
    publisher: { "@id": entityId("organization") },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(post.path),
      datePublished: post.publishedAt,
      ...(post.image ? { image: imageUrl(post.image) } : {}),
    })),
  };
}

/** One article, tied to its page, the blog and the organisation by `@id`. */
export function blogPostingSchema(args: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  publishedAt: string;
  modifiedAt: string;
  author: string;
  section: string;
  minutes: number;
}): Json {
  const url = absoluteUrl(args.path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": entityId("article", args.path),
    headline: args.title,
    description: args.description,
    url,
    mainEntityOfPage: { "@id": entityId("webpage", args.path) },
    isPartOf: { "@id": blogId() },
    ...(args.image ? { image: imageUrl(args.image) } : {}),
    datePublished: args.publishedAt,
    dateModified: args.modifiedAt,
    author: authorNode(args.author),
    publisher: { "@id": entityId("organization") },
    articleSection: args.section,
    timeRequired: `PT${args.minutes}M`,
    inLanguage: "en-GB",
  };
}
