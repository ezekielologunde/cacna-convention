import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]";

const variantClass: Record<ButtonVariant, string> = {
  primary: "text-white shadow-[var(--shadow-glow-coral)]",
  secondary: "text-white shadow-[var(--shadow-glow-teal)]",
  outline:
    "border border-[var(--color-border)] text-[var(--color-fg)] hover:border-[var(--color-coral-text)] hover:text-[var(--color-coral-text)]",
  ghost: "text-[var(--color-fg)] hover:bg-[var(--color-surface)]",
};

const variantStyle: Partial<Record<ButtonVariant, CSSProperties>> = {
  primary: { background: "var(--gradient-cta)" },
  secondary: { background: "var(--color-teal-deep)" },
};

type CommonProps = { variant?: ButtonVariant; children: ReactNode; className?: string };
type ButtonAsLink = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", children, className = "", ...rest } = props;
  const classes = [base, variantClass[variant], className].filter(Boolean).join(" ");
  const style = variantStyle[variant];

  if (rest.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <Link href={href} className={classes} style={style} {...anchorRest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} style={style} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
