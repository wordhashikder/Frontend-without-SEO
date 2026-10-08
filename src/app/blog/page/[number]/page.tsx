import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  BlogListing,
  blogPage,
  MAX_BLOG_PAGE,
  POSTS_PER_PAGE,
} from "@/components/blog/blog-listing";
import { api } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { blogListingPath, routes } from "@/lib/site";

/*
 * Older posts: /blog/page/2/, /blog/page/3/ … A path segment rather than
 * `?page=` keeps every listing page ISR-cached and crawlable.
 */
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = PageProps<"/blog/page/[number]">;

async function load({ params }: Pick<Props, "params">) {
  const { number } = await params;
  if (!/^[1-9]\d?$/.test(number)) notFound();

  const page = Number(number);
  if (page === 1) permanentRedirect(routes.blog);
  if (page > MAX_BLOG_PAGE) notFound();

  const listing = await api.blogPosts({ page, pageSize: POSTS_PER_PAGE });
  if (listing.items.length === 0) notFound();
  return { page, listing };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { page, listing } = await load(props);
  return {
    ...pageMetadata({
      title: `${blogPage.title}: Page ${page}`,
      description: blogPage.description,
      path: blogListingPath(page),
    }),
    pagination: {
      previous: blogListingPath(page - 1),
      next: page < listing.pages ? blogListingPath(page + 1) : null,
    },
  };
}

export default async function BlogListingPage(props: Props) {
  const { page, listing } = await load(props);
  return <BlogListing listing={listing} page={page} />;
}
