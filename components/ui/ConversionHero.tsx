import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";

/**
 * The site's boldest hero treatment -- real photo + full gradient overlay
 * + the largest CTA on the site -- reserved for the three pages whose
 * entire job is conversion (Register, Store, Give), instead of the
 * quieter gradient-only PageHero every content page uses.
 *
 * Deliberately synchronous (no getTranslations/async data fetching
 * inside): callers resolve their own strings and pass them down as props,
 * so this never needs the "async Server Component" test-resolution
 * workaround (see tests/app/archive.test.tsx's resolveRegisterCta) that a
 * component calling getTranslations directly would require everywhere
 * it's used.
 */
export function ConversionHero({
  photoSrc,
  tone = "red",
  badge,
  heading,
  body,
  cta,
  children,
}: {
  photoSrc: string;
  tone?: "red" | "blue";
  badge?: string;
  heading: string;
  body: string;
  cta: { label: string; href: string; external?: boolean; ariaLabel?: string };
  /** Extra content rendered between the heading and body -- e.g.
   *  Register's theme quote or price-increase urgency callout. */
  children?: ReactNode;
}) {
  const gradient = tone === "blue" ? "var(--gradient-hero-alt)" : "var(--gradient-hero)";
  const ctaTextColor = tone === "blue" ? "var(--color-blue-text)" : "var(--color-red-text)";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={photoSrc} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: gradient, opacity: 0.93 }} />
      </div>

      <div className="relative px-6 py-20 sm:py-28">
        <Reveal className="mx-auto max-w-3xl text-center 2xl:max-w-4xl">
          {badge && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-xs font-bold tracking-[0.15em] text-white uppercase backdrop-blur-sm">
              {badge}
            </span>
          )}
          <h1 className={`${badge ? "mt-6" : ""} text-balance font-display text-5xl leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-8xl`}>
            {heading}
          </h1>

          {children}

          <p className="mx-auto mt-6 max-w-[52ch] text-lg text-white/85">{body}</p>

          <div className="mt-9 flex justify-center">
            <Magnetic strength={0.3}>
              <a
                href={cta.href}
                aria-label={cta.ariaLabel}
                {...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex min-h-14 items-center gap-2 rounded-full bg-white px-10 text-lg font-bold shadow-2xl transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                style={{ color: ctaTextColor }}
              >
                {cta.label}
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
