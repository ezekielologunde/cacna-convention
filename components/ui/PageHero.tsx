import type { ComponentType, ReactNode } from "react";
import Image from "next/image";

/**
 * Shared hero band for interior pages. Gives every top-level page beyond
 * the homepage the same bold visual weight: a full-bleed red/blue
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
  tone = "red",
  icon: Icon,
  photoSrc,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  variant?: "center" | "split";
  stat?: { label: string; value: string };
  /** "red" (default) or "blue" — used sparingly so a handful of pages
   *  (About, Contact, Archive, Give) don't read identically to every other page. */
  tone?: "red" | "blue";
  /** Small badge icon (lucide-react component) giving a page its own
   *  identity mark — used by the sub-conference program pages so Youth,
   *  Children, CACMA, etc. read as distinct destinations, not the same
   *  hero repeated seven times. */
  icon?: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  /** Optional real photo behind the gradient (Ken Burns drift, same as the
   *  homepage hero) -- used sparingly, on pages that have a genuinely
   *  relevant photo on hand, rather than every PageHero call site. */
  photoSrc?: string;
}) {
  const gradient = tone === "blue" ? "var(--gradient-hero-alt)" : "var(--gradient-hero)";
  return (
    <section
      className="relative overflow-hidden px-6 py-16 sm:py-24"
      style={{ background: photoSrc ? undefined : gradient, clipPath: "polygon(0 0, 100% 0, 100% 97%, 0 100%)" }}
    >
      {photoSrc && (
        <div aria-hidden="true" className="absolute inset-0">
          <Image src={photoSrc} alt="" fill sizes="100vw" className="hero-kenburns object-cover" priority />
          <div className="absolute inset-0" style={{ background: gradient, opacity: 0.88 }} />
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--color-red)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--color-blue)" }}
      />
      {variant === "split" && stat ? (
        <div className="relative mx-auto flex max-w-4xl flex-wrap items-end justify-between gap-8 2xl:max-w-5xl">
          <div className="max-w-xl">
            {Icon && (
              <span className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-white/12 text-white backdrop-blur-sm">
                <Icon aria-hidden={true} size={22} strokeWidth={2} />
              </span>
            )}
            {eyebrow && (
              <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-mist)] uppercase">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-3 font-display text-4xl text-white sm:text-5xl lg:text-6xl">{title}</h1>
            {/* Full-opacity white -- text-white/85 measured ~4.2:1 at the gradient's
                lightest stop, below the 4.5:1 AA minimum for body text (the token
                file's 5.17-5.29:1 ratios were verified at 100% opacity only). */}
            {subtitle && <p className="mt-3 max-w-[52ch] text-white">{subtitle}</p>}
          </div>
          <div className="rounded-2xl bg-white/10 px-6 py-4 text-right backdrop-blur-sm">
            <div className="text-xs font-bold tracking-wide text-[var(--color-mist)] uppercase">
              {stat.label}
            </div>
            <div className="mt-1 font-display text-3xl text-white">{stat.value}</div>
          </div>
        </div>
      ) : (
        <div className="relative mx-auto max-w-3xl text-center 2xl:max-w-4xl">
          {Icon && (
            <span className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-white/12 text-white backdrop-blur-sm">
              <Icon aria-hidden={true} size={22} strokeWidth={2} />
            </span>
          )}
          {eyebrow && (
            <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-mist)] uppercase">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 font-display text-4xl text-white sm:text-5xl lg:text-6xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-3 max-w-[56ch] text-white">{subtitle}</p>}
        </div>
      )}
    </section>
  );
}
