import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import { blogPostPath, installerPath, locationPath, routes } from "@/lib/site";
import type { BlogPostSummary, InstallerCard } from "@/lib/types";

// Regenerated hourly so new locations, installers and posts are discovered quickly.
export const revalidate = 3600;

const staticPages: { path: string; priority: number }[] = [
  { path: routes.home, priority: 1 },
  { path: routes.quotes, priority: 0.9 },
  { path: routes.installers, priority: 0.9 },
  { path: routes.howItWorks, priority: 0.8 },
  { path: routes.join, priority: 0.8 },
  { path: routes.faq, priority: 0.7 },
  { path: routes.accreditations, priority: 0.7 },
  { path: routes.safety, priority: 0.7 },
  { path: routes.vetting, priority: 0.6 },
  { path: routes.about, priority: 0.6 },
  { path: routes.contact, priority: 0.5 },
  { path: routes.blog, priority: 0.7 },
  { path: routes.privacy, priority: 0.2 },
  { path: routes.terms, priority: 0.2 },
  { path: routes.cookies, priority: 0.2 },
];

const PAGE_SIZE = 100;
/** Sitemap files are limited to 50,000 URLs; stay comfortably below that. */
const MAX_PAGES = 400;

async function allInstallers() {
  const items: InstallerCard[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await api.installers({ page, pageSize: PAGE_SIZE });
    if (!result) break;
    items.push(...result.items);
    if (page >= result.pages) break;
  }
  return items;
}

/** Every published post; an unreachable API leaves them out of this hour's sitemap. */
async function allPosts() {
  const items: BlogPostSummary[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const result = await api.blogPosts({ page, pageSize: PAGE_SIZE });
      items.push(...result.items);
      if (page >= result.pages) break;
    }
  } catch (error) {
    console.error("[sitemap] blog posts skipped", error);
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [locations, installers, posts] = await Promise.all([
    api.locations(),
    allInstallers(),
    allPosts(),
  ]);

  // Each installer appears once, at its one canonical profile URL, however
  // many location pages list it.
  return [
    ...staticPages.map(({ path, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...locations.map((location) => ({
      url: absoluteUrl(locationPath(location.slug)),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...installers.map((installer) => ({
      url: absoluteUrl(installerPath(installer.slug)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(blogPostPath(post.slug)),
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
