import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/blog/article-body";
import { PostCard, PostCover, PostMeta } from "@/components/blog/post-card";
import { LocationsDirectory } from "@/components/layout/locations-directory";
import { Breadcrumbs } from "@/components/sections/breadcrumbs";
import { JsonLd } from "@/components/sections/json-ld";
import { PostcodeForm } from "@/components/sections/postcode-form";
import { Container, Eyebrow, Section } from "@/components/ui/layout";
import { api } from "@/lib/api";
import {
  absoluteUrl,
  blogPostingSchema,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";
import { blogPostPath, routes } from "@/lib/site";

// Rendered on first request, then cached and refreshed every 5 minutes (ISR).
// Nothing is fetched at build time: the API is not reachable during image builds.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = PageProps<"/blog/[slug]">;

async function loadPost({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const post = await api.blogPost(slug);
  if (!post) notFound();
  return post;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const post = await loadPost(props);
  const path = blogPostPath(post.slug);
  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt;
  const metadata = pageMetadata({ title, description, path });
  const image = post.cover_image_url
    ? {
        url: post.cover_image_url.startsWith("/")
          ? absoluteUrl(post.cover_image_url)
          : post.cover_image_url,
        alt: post.cover_image_alt ?? post.title,
      }
    : undefined;

  return {
    ...metadata,
    authors: [{ name: post.author_name }],
    // An SEO title is written to stand alone, without the " | PickASparky" suffix.
    ...(post.seo_title ? { title: { absolute: post.seo_title } } : {}),
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      section: post.category,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function BlogPostPage(props: Props) {
  const post = await loadPost(props);
  const related = await api.relatedBlogPosts(post.slug, 3);
  const path = blogPostPath(post.slug);
  const description = post.seo_description ?? post.excerpt;

  return (
    <>
      <article aria-labelledby="post-title">
        <Container className="max-w-[880px] pt-6 md:pt-10">
          <Breadcrumbs
            items={[
              { name: "Home", path: routes.home },
              { name: "Blog", path: routes.blog },
              { name: post.title, path },
            ]}
          />

          <header className="mt-8 md:mt-12">
            <Eyebrow className="mb-3">{post.category}</Eyebrow>
            <h1
              id="post-title"
              className="text-[32px] font-extrabold leading-[1.2] tracking-[-0.02em] sm:text-[40px] md:text-[44px]"
            >
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed sm:text-xl sm:leading-[1.6]">
              {post.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5 text-xs">
              <p>
                By{" "}
                <span className="font-semibold text-ink">
                  {post.author_name}
                </span>
              </p>
              <PostMeta post={post} />
            </div>
          </header>
        </Container>

        {post.cover_image_url ? (
          <Container className="mt-8 max-w-[1040px] md:mt-10">
            <PostCover
              post={post}
              sizes="(min-width: 1104px) 1040px, 100vw"
              priority
              className="aspect-[16/9] rounded-2xl"
            />
          </Container>
        ) : null}

        <Container className="max-w-[880px] pt-8 pb-14 md:pt-12 md:pb-16">
          <ArticleBody markdown={post.body} className="max-w-[720px]" />

          <aside
            aria-labelledby="post-cta-heading"
            className="mt-14 rounded-2xl border border-[#e0f5ea] bg-mint-soft p-6 sm:p-8"
          >
            <Eyebrow className="mb-2">Free, no obligation</Eyebrow>
            <h2
              id="post-cta-heading"
              className="text-[22px] font-bold leading-tight tracking-[-0.01em] sm:text-2xl"
            >
              Compare up to 5 quotes from trusted EV charger installers
            </h2>
            <p className="mt-2 text-sm">
              Enter your postcode to get started. It takes about two minutes.
            </p>
            <PostcodeForm
              id="post-cta-postcode"
              variant="inline"
              className="mt-5 max-w-[520px]"
            />
          </aside>
        </Container>
      </article>

      {related.length > 0 ? (
        <Section tone="surface" spacing="sm" aria-labelledby="related-heading">
          <Container>
            <h2
              id="related-heading"
              className="text-2xl font-extrabold tracking-[-0.01em] sm:text-[28px]"
            >
              Keep reading
            </h2>
            <ul className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <PostCard post={item} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <LocationsDirectory />

      <JsonLd
        data={[
          webPageSchema({
            title: post.seo_title ?? post.title,
            description,
            path,
            extra: { mainEntity: { "@id": `${absoluteUrl(path)}#article` } },
          }),
          blogPostingSchema({
            title: post.title,
            description,
            path,
            image: post.cover_image_url,
            publishedAt: post.published_at,
            modifiedAt: post.updated_at,
            author: post.author_name,
            section: post.category,
            minutes: post.reading_minutes,
          }),
        ]}
      />
    </>
  );
}
