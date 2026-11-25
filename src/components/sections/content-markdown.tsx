import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { linkTarget } from "@/lib/links";
import { cn } from "@/lib/utils";

/*
 * Markdown the team writes in the Dashboard (location page text, policy
 * sections). Raw HTML is never rendered and unsafe link protocols are removed
 * (the API also refuses them), so content cannot inject markup or scripts.
 */

/** Images in the text are only shown for the `page` variant (pages the team creates). */
const allowedImage = (src: string) =>
  (src.startsWith("/") && !src.startsWith("//")) ||
  src.startsWith("https://res.cloudinary.com/");

type Variant = "compact" | "legal" | "page";

const styles: Record<
  Variant,
  {
    root: string;
    p: string;
    h: string;
    /** `###` and below, when the variant sets them apart from `##`. */
    sub?: string;
    list: string;
    link: string;
    tableBox: string;
    table: string;
    cell: string;
  }
> = {
  compact: {
    root: "space-y-5 text-sm leading-[1.45]",
    p: "",
    h: "pt-1 text-base font-bold text-ink",
    list: "list-disc space-y-1.5 pl-5 marker:text-primary",
    link: "font-medium text-primary-dark underline decoration-primary/40 underline-offset-4 hover:decoration-primary",
    tableBox: "",
    table: "text-sm",
    cell: "px-3 py-2.5",
  },
  legal: {
    root: "",
    p: "mt-4 text-base leading-relaxed sm:text-lg sm:leading-8",
    h: "mt-6 text-lg font-bold text-ink",
    list: "mt-5 space-y-2.5 pl-4 text-base leading-relaxed sm:mt-6 sm:space-y-3 sm:text-lg sm:leading-8 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[0.8em] [&>li]:before:left-0 [&>li]:before:size-[5px] [&>li]:before:rounded-full [&>li]:before:bg-primary",
    link: "font-medium text-primary underline-offset-4 hover:underline",
    tableBox: "mt-5",
    table: "text-base sm:text-lg",
    cell: "px-4 py-3",
  },
  page: {
    root: "[&>*:first-child]:mt-0",
    p: "mt-4 text-base leading-relaxed sm:text-lg sm:leading-8",
    h: "mt-8 text-xl font-bold text-ink sm:text-2xl",
    sub: "mt-6 text-lg font-bold text-ink sm:text-xl",
    list: "mt-5 space-y-2.5 pl-4 text-base leading-relaxed sm:mt-6 sm:space-y-3 sm:text-lg sm:leading-8 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[0.8em] [&>li]:before:left-0 [&>li]:before:size-[5px] [&>li]:before:rounded-full [&>li]:before:bg-primary",
    link: "font-medium text-primary underline-offset-4 hover:underline",
    tableBox: "mt-6",
    table: "text-base sm:text-lg",
    cell: "px-4 py-3",
  },
};

function components(variant: Variant): Components {
  const style = styles[variant];
  const heading: Components["h2"] = ({ node: _node, ...props }) => (
    <h3 className={style.h} {...props} />
  );
  // Pages the team creates set `###` apart from `##`; the other variants keep one heading style.
  const subHeading: Components["h4"] = ({ node: _node, ...props }) => (
    <h4 className={style.sub} {...props} />
  );
  const lower = style.sub ? subHeading : heading;
  return {
    h1: heading,
    h2: heading,
    h3: lower,
    h4: lower,
    p: ({ node: _node, ...props }) => <p className={style.p} {...props} />,
    ul: ({ node: _node, ...props }) => <ul className={style.list} {...props} />,
    ol: ({ node: _node, ...props }) => (
      <ol
        className={cn(style.list, "list-decimal [&>li]:before:hidden")}
        {...props}
      />
    ),
    strong: ({ node: _node, ...props }) => (
      <strong className="font-semibold text-ink" {...props} />
    ),
    a: ({ node: _node, href = "", children, ...props }) => {
      const target = linkTarget(href);
      if (target.kind === "internal") {
        return (
          <Link href={target.path} className={style.link} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={target.href}
          className={style.link}
          {...(target.kind === "external" && href.startsWith("https://")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        >
          {children}
        </a>
      );
    },
    // Tables (GitHub-style Markdown): wide ones scroll inside their own box
    // rather than the page.
    table: ({ node: _node, ...props }) => (
      <div
        className={cn(
          "overflow-x-auto rounded-xl border border-line",
          style.tableBox,
        )}
      >
        <table
          className={cn(
            "w-full min-w-[420px] border-collapse text-left",
            style.table,
          )}
          {...props}
        />
      </div>
    ),
    thead: ({ node: _node, ...props }) => (
      <thead className="bg-mint-soft" {...props} />
    ),
    th: ({ node: _node, ...props }) => (
      <th
        className={cn(
          "border-b border-line font-semibold text-ink",
          style.cell,
        )}
        {...props}
      />
    ),
    td: ({ node: _node, ...props }) => (
      <td
        className={cn(
          "border-b border-line align-top [tr:last-child_&]:border-b-0",
          style.cell,
        )}
        {...props}
      />
    ),
    img:
      variant === "page"
        ? ({ node: _node, src, alt }) =>
            typeof src === "string" && allowedImage(src) ? (
              // Unknown dimensions (the team uploads them), so a plain lazy image.
              // biome-ignore lint/performance/noImgElement: dimensions are unknown for images inside Markdown
              <img
                src={src}
                alt={alt ?? ""}
                loading="lazy"
                decoding="async"
                className="my-7 block h-auto w-full rounded-xl"
              />
            ) : null
        : () => null,
  };
}

export function ContentMarkdown({
  children,
  variant = "compact",
  className,
}: {
  children: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <div className={cn(styles[variant].root, className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={components(variant)}>
        {children}
      </Markdown>
    </div>
  );
}
