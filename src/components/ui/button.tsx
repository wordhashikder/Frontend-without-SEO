import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary:
    "bg-primary text-white shadow-[0_1px_2px_rgb(10_155_83/0.3)] hover:bg-primary-dark",
  dark: "bg-ink text-white hover:bg-ink/90",
  outline: "border border-line bg-white text-ink hover:border-ink/30",
  /** Green text link with an arrow, e.g. "Search Installers →". */
  link: "text-primary hover:text-primary-dark",
} as const;

const sizes = {
  sm: "h-9 rounded-md px-4 text-[13px]",
  md: "h-11 rounded-lg px-5 text-sm",
  lg: "h-[52px] rounded-lg px-6 text-[15px]",
} as const;

type StyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Append the → arrow used on most calls to action. */
  arrow?: boolean;
  fullWidth?: boolean;
};

function classes({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: StyleProps & { className?: string }) {
  return cn(
    base,
    variants[variant],
    variant === "link" ? "h-auto p-0 text-sm" : sizes[size],
    fullWidth && "w-full",
    className,
  );
}

function Content({
  children,
  arrow,
}: {
  children: ReactNode;
  arrow?: boolean;
}) {
  return (
    <>
      {children}
      {arrow ? (
        <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
      ) : null}
    </>
  );
}

type ButtonProps = ComponentProps<"button"> & StyleProps;

export function Button({
  variant,
  size,
  arrow,
  fullWidth,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, fullWidth, className })}
      {...props}
    >
      <Content arrow={arrow}>{children}</Content>
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({
  variant,
  size,
  arrow,
  fullWidth,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={classes({ variant, size, fullWidth, className })}
      {...props}
    >
      <Content arrow={arrow}>{children}</Content>
    </Link>
  );
}
