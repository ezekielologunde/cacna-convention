import type { ReactNode } from "react";

/**
 * Shared hero band for interior pages. Previously every page beyond the
 * homepage was a bare `max-w-3xl` container with a plain `h1` and no hero
 * art at all — this gives every top-level page the same visual weight as
 * the homepage's flame-gradient hero, without literally repeating it.
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
  tone = "flame",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  variant?: "center" | "split";
  stat?: { label: string; value: string };
  /** "flame" (default, maroon/red) or "navy" — used sparingly so a handful
   *  of pages (About, Give) don't read identically to every other page. */
  tone?: "flame" | "navy";
}) {
  return (
    <section
      className="relative overflow-hidden px-6 py-14 sm:py-20"
      style={{ background: tone === "navy" ? "var(--navy-hero)" : "var(--flame-hero)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--color-gold)" }}
      />
      {variant === "split" && stat ? (
        <div className="relative mx-auto flex max-w-4xl flex-wrap items-end justify-between gap-8">
          <div className="max-w-xl">
            {eyebrow && (
              <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-gold-light)] uppercase">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-3 max-w-[52ch] text-white/80">{subtitle}</p>}
          </div>
          <div className="rounded-2xl bg-white/10 px-6 py-4 text-right backdrop-blur-sm">
            <div className="text-xs font-bold tracking-wide text-[var(--color-gold-light)] uppercase">
              {stat.label}
            </div>
            <div className="mt-1 font-display text-2xl text-white">{stat.value}</div>
          </div>
        </div>
      ) : (
        <div className="relative mx-auto max-w-3xl text-center">
          {eyebrow && (
            <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-gold-light)] uppercase">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-3 max-w-[56ch] text-white/80">{subtitle}</p>}
        </div>
      )}
    </section>
  );
}
