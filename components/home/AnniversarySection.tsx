import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
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
  heading,
  cta,
  opensInNewTabLabel,
}: {
  locale: string;
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
    <section
      className="relative overflow-hidden px-6 py-20 text-center sm:py-24"
      style={{ background: "var(--gradient-band)" }}
    >
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
        <div className="font-display text-7xl text-[var(--color-gold)] sm:text-8xl">{anniversary.years}</div>
        <Reveal>
          <h2 className="mt-2 font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">
            {heading}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-5 max-w-[52ch] text-white/80">{anniversary.description}</p>
          <p className="mt-5 text-xs font-bold tracking-[0.2em] text-[var(--color-gold)] uppercase">
            {formattedDate} · {anniversary.location}
          </p>
          <div className="mt-8">
            <Button
              href={anniversary.moreInfoUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              aria-label={`${cta}${opensInNewTabLabel}`}
            >
              {cta}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
