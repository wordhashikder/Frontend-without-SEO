import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/*
 * Renders an article's Markdown (written by the admin) with the site's type
 * styles. Raw HTML is never rendered and unsafe link protocols (javascript:
 * and the like) are removed, so a post cannot inject markup or scripts.
 */

const isInternal = (href: string) =>
  href.startsWith("/") && !href.startsWith("//");

const components: Components = {
  // The page title is the only h1; a "# Heading" in a post becomes a section heading.
  h1: ({ node: _node, ...props }) => (
    <h2
      className="mt-12 mb-4 text-2xl font-extrabold leading-tight tracking-[-0.01em] sm:text-[28px]"
      {...props}
    />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2
      className="mt-12 mb-4 text-2xl font-extrabold leading-tight tracking-[-0.01em] sm:text-[28px]"
      {...props}
    />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 className="mt-8 mb-3 text-xl font-bold leading-snug" {...props} />
  ),
  h4: ({ node: _node, ...props }) => (
    <h4 className="mt-6 mb-2 text-base font-bold text-ink" {...props} />
  ),
  p: ({ node: _node, ...props }) => <p className="my-5" {...props} />,
  ul: ({ node: _node, ...props }) => (
    <ul
      className="my-5 list-disc space-y-2 pl-6 marker:text-primary"
      {...props}
    />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol
      className="my-5 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-primary"
      {...props}
    />
  ),
  li: ({ node: _node, ...props }) => <li className="pl-1" {...props} />,
  strong: ({ node: _node, ...props }) => (
    <strong className="font-semibold text-ink" {...props} />
  ),
  a: ({ node: _node, href = "", children, ...props }) => {
    const className =
      "font-medium text-primary-dark underline decoration-primary/40 underline-offset-4 hover:decoration-primary";
    return isInternal(href) ? (
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      >
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  },
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      className="my-7 rounded-r-xl border-l-4 border-primary bg-mint-soft px-5 py-4 text-ink [&>p]:my-2"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-line" />,
  table: ({ node: _node, ...props }) => (
    // Wide tables scroll inside their own box rather than the page.
    <div className="my-7 overflow-x-auto rounded-xl border border-line">
      <table
        className="w-full min-w-[480px] border-collapse text-left text-sm"
        {...props}
      />
    </div>
  ),
  thead: ({ node: _node, ...props }) => (
    <thead className="bg-mint-soft" {...props} />
  ),
  th: ({ node: _node, ...props }) => (
    <th
      className="border-b border-line px-4 py-3 font-semibold text-ink"
      {...props}
    />
  ),
  td: ({ node: _node, ...props }) => (
    <td className="border-b border-line px-4 py-3 align-top" {...props} />
  ),
  code: ({ node: _node, ...props }) => (
    <code
      className="rounded bg-surface px-1.5 py-0.5 text-[0.9em] text-ink"
      {...props}
    />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre
      className="my-6 overflow-x-auto rounded-xl bg-surface p-4 text-sm [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  ),
  img: ({ node: _node, src, alt, ...props }) =>
    typeof src === "string" ? (
      // Images in a post have unknown sizes, so they are plain lazy images.
      // biome-ignore lint/performance/noImgElement: dimensions are unknown for images inside Markdown
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        className="my-7 h-auto w-full rounded-xl"
        {...props}
      />
    ) : null,
};

export function ArticleBody({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-base leading-[1.75] text-ink/80 sm:text-[17px] [&>*:first-child]:mt-0",
        className,
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {markdown}
      </Markdown>
    </div>
  );
}
