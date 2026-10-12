import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/*
 * Markdown the team writes in the Dashboard (location page text, policy
 * sections). Raw HTML is never rendered and unsafe link protocols are removed
 * (the API also refuses them), so content cannot inject markup or scripts.
 */

const isInternal = (href: string) =>
  href.startsWith("/") && !href.startsWith("//");

type Variant = "compact" | "legal";

const styles: Record<
  Variant,
  { root: string; p: string; h: string; list: string; link: string }
> = {
  compact: {
    root: "space-y-5 text-sm leading-[1.45]",
    p: "",
    h: "pt-1 text-base font-bold text-ink",
    list: "list-disc space-y-1.5 pl-5 marker:text-primary",
    link: "font-medium text-primary-dark underline decoration-primary/40 underline-offset-4 hover:decoration-primary",
  },
  legal: {
    root: "",
    p: "mt-4 text-base leading-relaxed sm:text-lg sm:leading-8",
    h: "mt-6 text-lg font-bold text-ink",
    list: "mt-5 space-y-2.5 pl-4 text-base leading-relaxed sm:mt-6 sm:space-y-3 sm:text-lg sm:leading-8 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[0.8em] [&>li]:before:left-0 [&>li]:before:size-[5px] [&>li]:before:rounded-full [&>li]:before:bg-primary",
    link: "font-medium text-primary underline-offset-4 hover:underline",
  },
};

function components(variant: Variant): Components {
  const style = styles[variant];
  const heading: Components["h2"] = ({ node: _node, ...props }) => (
    <h3 className={style.h} {...props} />
  );
  return {
    h1: heading,
    h2: heading,
    h3: heading,
    h4: heading,
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
    a: ({ node: _node, href = "", children, ...props }) =>
      isInternal(href) ? (
        <Link href={href} className={style.link} {...props}>
          {children}
        </Link>
      ) : (
        <a
          href={href}
          className={style.link}
          {...(href.startsWith("https://")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        >
          {children}
        </a>
      ),
    img: () => null,
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
