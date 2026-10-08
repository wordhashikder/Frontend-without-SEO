import type { Metadata } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import {
  BlogListing,
  blogPage,
  POSTS_PER_PAGE,
} from "@/components/blog/blog-listing";
import { api } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { blogListingPath, routes } from "@/lib/site";
import type { BlogPostSummary, Paginated } from "@/lib/types";

// Rendered on first request, then cached and refreshed every 5 minutes (ISR),
// so posts the admin publishes appear within minutes.
export const revalidate = 300;

const noPosts: Paginated<BlogPostSummary> = {
  items: [],
  total: 0,
  page: 1,
  page_size: POSTS_PER_PAGE,
  pages: 0,
};

/**
 * The first page of posts. The API is usually not reachable while the Docker
 * image is built, so the build renders an empty page that ISR replaces with
 * the real one; at runtime an outage propagates and is never cached as "empty".
 */
async function loadListing() {
  try {
    return await api.blogPosts({ page: 1, pageSize: POSTS_PER_PAGE });
  } catch (error) {
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return noPosts;
    throw error;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const listing = await loadListing();
  return {
    ...pageMetadata({ ...blogPage, path: routes.blog }),
    pagination: {
      previous: null,
      next: listing.pages > 1 ? blogListingPath(2) : null,
    },
  };
}

export default async function BlogPage() {
  return <BlogListing listing={await loadListing()} page={1} />;
}
