import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SitePageView } from "@/components/pages/site-page-view";
import { api } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

/*
 * Pages the team creates in the Dashboard (Website content → Pages) live at addresses of
 * their own choosing, so one catch-all route serves them. Every built-in page has its own
 * route, which always wins over this one. An address with no page is a 404; an address a
 * page used to have redirects permanently to where it is now.
 *
 * It reads `searchParams` (for the team's draft preview link), so these pages render per
 * request; the page data itself is cached and refreshed the moment the team saves.
 */

type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ preview?: string | string[] }>;
};

/** The shape the API accepts, checked first so stray requests never reach it. */
const ADDRESS =
  /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*){0,4}\/$/;

async function load({ params, searchParams }: Props) {
  const { path: segments } = await params;
  const { preview } = await searchParams;
  const path = `/${segments.join("/")}/`;
  if (!ADDRESS.test(path)) notFound();
  const token = typeof preview === "string" && preview ? preview : undefined;
  const result = await api.page(path, token);
  if (!result) notFound();
  if (result.redirect_to) permanentRedirect(result.redirect_to);
  if (!result.page) notFound();
  return result.page;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const page = await load(props);
  const metadata = pageMetadata({
    title: page.seo_title ?? page.title,
    description: page.seo_description ?? page.intro ?? page.title,
    path: page.path,
    // Hidden from search engines until the page is published and has content.
    index: page.indexable && !page.preview,
  });
  return metadata;
}

export default async function SitePageRoute(props: Props) {
  const page = await load(props);
  return <SitePageView page={page} />;
}
