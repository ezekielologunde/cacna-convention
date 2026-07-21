import type { ReactNode } from "react";

/**
 * Shared hero band for interior pages. Gives every top-level page beyond
 * the homepage the same bold visual weight: a full-bleed coral/teal
 * gradient, two offset blur circles for a two-tone energy signature, and a
 * diagonal-cut bottom edge instead of a flat rectangle.
 *
 * `variant="split"` puts a stat/date callout beside the heading (for pages
 * with one obvious headline fact — a date, a count); `variant="center"`
 * (default) is a centered eyebrow/title/subtitle stack for pages without
 * one single callout fact.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  variant = "center",
  stat,
  tone = "coral",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  variant?: "center" | "split";
  stat?: { label: string; value: string };
  /** "coral" (default) or "teal" — used sparingly so a handful of pages
   *  (About, Contact, Archive, Give) don't read identically to every other page. */
  tone?: "coral" | "teal";
}) {
  const gradient = tone === "teal" ? "var(--gradient-hero-teal)" : "var(--gradient-hero-coral)";
  return (
    <section
      className="relative overflow-hidden px-6 py-16 sm:py-24"
      style={{ background: gradient, clipPath: "polygon(0 0, 100% 0, 100% 97%, 0 100%)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--color-coral)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--color-teal)" }}
      />
      {variant === "split" && stat ? (
        <div className="relative mx-auto flex max-w-4xl flex-wrap items-end justify-between gap-8 2xl:max-w-5xl">
          <div className="max-w-xl">
            {eyebrow && (
              <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-mist)] uppercase">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-3 max-w-[52ch] text-white/85">{subtitle}</p>}
          </div>
          <div className="rounded-2xl bg-white/10 px-6 py-4 text-right backdrop-blur-sm">
            <div className="text-xs font-bold tracking-wide text-[var(--color-mist)] uppercase">
              {stat.label}
            </div>
            <div className="mt-1 font-display text-2xl text-white">{stat.value}</div>
          </div>
        </div>
      ) : (
        <div className="relative mx-auto max-w-3xl text-center 2xl:max-w-4xl">
          {eyebrow && (
            <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-mist)] uppercase">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-3 max-w-[56ch] text-white/85">{subtitle}</p>}
        </div>
      )}
    </section>
  );
}
