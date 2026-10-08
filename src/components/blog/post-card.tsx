import { ArrowRight, Clock, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/layout";
import { blogPostPath } from "@/lib/site";
import type { BlogPostSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/London",
});

/** "6 October 2026" */
export const formatPostDate = (iso: string) => dateFormat.format(new Date(iso));

/** Publication date and reading time, e.g. "6 October 2026 · 3 min read". */
export function PostMeta({
  post,
  className,
}: {
  post: Pick<BlogPostSummary, "published_at" | "reading_minutes">;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs",
        className,
      )}
    >
      <time dateTime={post.published_at}>
        {formatPostDate(post.published_at)}
      </time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock aria-hidden className="size-3.5" strokeWidth={1.75} />
        {post.reading_minutes} min read
      </span>
    </p>
  );
}

type CoverProps = {
  post: Pick<BlogPostSummary, "cover_image_url" | "cover_image_alt">;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** The post's cover, or a branded panel when it has none. Decorative in cards. */
export function PostCover({ post, sizes, priority, className }: CoverProps) {
  return (
    <div
      className={cn("relative overflow-hidden bg-mint", className)}
      aria-hidden={post.cover_image_url ? undefined : true}
    >
      {post.cover_image_url ? (
        <Image
          src={post.cover_image_url}
          alt={post.cover_image_alt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-mint to-primary-soft">
          <Zap
            className="size-12 fill-primary/20 text-primary"
            strokeWidth={1.25}
          />
        </div>
      )}
    </div>
  );
}

/** A post in the listing grid. The whole card is one link (the title's). */
export function PostCard({
  post,
  headingLevel: Heading = "h3",
}: {
  post: BlogPostSummary;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-shadow duration-200 focus-within:shadow-card hover:shadow-card">
      <PostCover
        post={post}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/10]"
      />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Eyebrow className="mb-2">{post.category}</Eyebrow>
        <Heading className="text-lg font-bold leading-snug tracking-[-0.01em]">
          <Link
            href={blogPostPath(post.slug)}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-primary-dark"
          >
            {post.title}
          </Link>
        </Heading>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>
        <PostMeta post={post} className="mt-auto pt-5" />
      </div>
    </article>
  );
}

/** The lead story at the top of the first listing page. */
export function FeaturedPost({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group relative grid overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-shadow duration-200 focus-within:shadow-card hover:shadow-card lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <PostCover
        post={post}
        sizes="(min-width: 1024px) 660px, 100vw"
        priority
        className="aspect-[16/9] lg:aspect-auto lg:min-h-[360px]"
      />
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <p className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.04em]">
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary-dark">
            Featured
          </span>
          <span className="text-primary">{post.category}</span>
        </p>
        <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.02em] sm:text-[32px]">
          <Link
            href={blogPostPath(post.slug)}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-primary-dark"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed sm:text-base">
          {post.excerpt}
        </p>
        <PostMeta post={post} className="mt-5" />
        <span
          aria-hidden
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-primary-dark"
        >
          Read the article
          <ArrowRight className="size-4" strokeWidth={2.25} />
        </span>
      </div>
    </article>
  );
}
