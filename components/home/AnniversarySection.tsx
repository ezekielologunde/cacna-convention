import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { anniversary } from "@/lib/content/anniversary";

// A handful of small aria-hidden decorative dots -- gold + white/30,
// absolutely positioned and rotated, animated with the sparkle-float
// keyframe (app/globals.css). Purely CSS, no new dependency, and
// automatically respects prefers-reduced-motion via that file's existing
// global rule.
const CONFETTI_DOTS = [
  { top: "12%", left: "8%", size: 10, delay: "0s", color: "var(--color-gold)" },
  { top: "22%", left: "88%", size: 14, delay: "0.6s", color: "rgba(255,255,255,0.3)" },
  { top: "68%", left: "12%", size: 12, delay: "1.1s", color: "rgba(255,255,255,0.3)" },
  { top: "78%", left: "92%", size: 9, delay: "1.6s", color: "var(--color-gold)" },
  { top: "45%", left: "95%", size: 8, delay: "0.3s", color: "var(--color-gold)" },
  { top: "8%", left: "45%", size: 11, delay: "2s", color: "rgba(255,255,255,0.3)" },
] as const;

export function AnniversarySection({
  locale,
  badge,
  heading,
  cta,
  opensInNewTabLabel,
}: {
  locale: string;
  badge: string;
  heading: string;
  cta: string;
  opensInNewTabLabel: string;
}) {
  const dateFormatter = new Intl.DateTimeFormat(locale === "yo" ? "yo-NG" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const formattedDate = dateFormatter.format(new Date(`${anniversary.date}T12:00:00Z`));

  return (
    <section className="relative overflow-hidden px-6 py-24 text-center sm:py-32">
      {/* Real photo behind the gradient (same Ken Burns treatment as every
          other photo hero on this site) -- bumped from a flat dark band to
          this project's boldest available treatment per the user's "ads"
          request, reserved elsewhere for the three conversion pages
          (Register/Store/Give). opacity=0.9 (vs. those pages' 0.93) since
          --gradient-band is darker than --gradient-hero to begin with, so
          gold/white text stays comfortably AA either way. */}
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src="/photos/gallery/IMG-20250719-WA0052.jpg"
          alt=""
          fill
          sizes="100vw"
          className="hero-kenburns object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-band)", opacity: 0.9 }} />
      </div>

      {CONFETTI_DOTS.map((dot, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="sparkle-float pointer-events-none absolute rounded-sm"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            background: dot.color,
            animationDelay: dot.delay,
            // The keyframe animates `transform` itself (translateY + this
            // custom property), so the per-dot rotation has to travel in as
            // a CSS variable rather than a plain inline `transform` -- a
            // real `transform` here would just be overwritten by the
            // animation on the first frame.
            ["--sparkle-rotate" as string]: `${(i * 37) % 45}deg`,
          }}
        />
      ))}

      <div className="relative mx-auto max-w-2xl">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-xs font-bold tracking-[0.15em] text-white uppercase backdrop-blur-sm">
            {badge}
          </span>
        </Reveal>
        <div className="mt-4 font-display text-8xl text-[var(--color-gold)] sm:text-9xl">{anniversary.years}</div>
        <Reveal>
          <h2 className="mt-3 text-balance font-display text-4xl leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heading}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-[52ch] text-lg text-white/85">{anniversary.description}</p>
          <p className="mt-5 text-xs font-bold tracking-[0.2em] text-[var(--color-gold)] uppercase">
            {formattedDate} · {anniversary.location}
          </p>
          <div className="mt-9 flex justify-center">
            <Magnetic strength={0.3}>
              <a
                href={anniversary.moreInfoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${cta}${opensInNewTabLabel}`}
                className="inline-flex min-h-14 items-center gap-2 rounded-full bg-white px-10 text-lg font-bold text-[#16121a] shadow-2xl transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                {cta}
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
