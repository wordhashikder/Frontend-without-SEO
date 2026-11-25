import { site } from "@/lib/site";

/**
 * How a link written in CMS text (blog posts, location text, pages) behaves.
 *
 * - `internal`: a page of this site. Written as a path (`/uk/...`) or as a full
 *   address of this site (`https://www.pickasparky.com/...`); opens in the same tab.
 * - `same-tab`: an in-page anchor, `mailto:` or `tel:`; never opens a new tab.
 * - `external`: any other website; opens in a new tab so the reader keeps the article.
 */
export type LinkTarget =
  | { kind: "internal"; path: string }
  | { kind: "same-tab"; href: string }
  | { kind: "external"; href: string };

const bare = (host: string) => host.toLowerCase().replace(/^www\./, "");

/**
 * The addresses of this site: the one it is built for (a staging or preview
 * address included) and the production domain, with or without `www.`, so a
 * link pasted from the live site stays on the site wherever it is read.
 */
const ownHosts = (() => {
  const hosts = new Set(["pickasparky.com"]);
  try {
    hosts.add(bare(new URL(site.url).host));
  } catch {
    // An unusable site address leaves only the production domain.
  }
  return hosts;
})();

export function linkTarget(href: string): LinkTarget {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return { kind: "internal", path: href };
  }
  if (href.startsWith("#") || /^(mailto|tel):/i.test(href)) {
    return { kind: "same-tab", href };
  }
  if (/^https?:\/\//i.test(href)) {
    try {
      const url = new URL(href);
      if (ownHosts.has(bare(url.host))) {
        return {
          kind: "internal",
          path: `${url.pathname}${url.search}${url.hash}`,
        };
      }
    } catch {
      // Not a valid address: treated like any other outside link below.
    }
  }
  return { kind: "external", href };
}
