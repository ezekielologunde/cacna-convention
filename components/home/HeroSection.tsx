"use client";

import { useRef, useState, type MouseEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { Button } from "@/components/ui/Button";

// Depth multipliers for the three background orbs -- different magnitudes
// and directions per orb create actual parallax (near/far), not three
// copies of the same offset. Kept as plain numbers, not props: this hero
// isn't reused elsewhere, so there's nothing yet to parameterize for.
const ORB_DEPTH = [
  { x: 34, y: 26, size: 288, color: "var(--color-red)", opacity: 0.4, top: "-14%", right: "-8%" },
  { x: -26, y: 20, size: 256, color: "var(--color-gold)", opacity: 0.22, bottom: "-12%", left: "-10%" },
  { x: 18, y: -30, size: 200, color: "var(--color-blue)", opacity: 0.28, top: "38%", left: "58%" },
] as const;

/**
 * The homepage's hero -- same red gradient and copy as every other section
 * on this page, but with cursor-reactive depth: the background orbs and a
 * soft spotlight glow track the mouse (each orb at its own depth, so it
 * reads as parallax rather than one flat offset), while text and CTAs
 * still use the site's existing Reveal/Magnetic primitives. A client
 * component specifically for the mouse tracking -- the rest of the
 * homepage stays a plain Server Component.
 */
export function HeroSection({
  kicker,
  heading,
  body,
  registerHref,
  registerCta,
  scheduleHref,
  scheduleCta,
  comingSoonNote,
}: {
  kicker: string;
  heading: string;
  body: string;
  registerHref: string;
  registerCta: string;
  scheduleHref: string;
  scheduleCta: string;
  /** Set only when registration isn't open yet (see the homepage's own
   *  registrationOpen check) -- e.g. "Registration for Convention 2027
   *  opens in October 2026." Omitted entirely once registration opens. */
  comingSoonNote?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  // Gate on a fine pointer (mouse/trackpad), not just reduced-motion --
  // touch devices can fire a stray synthetic mousemove on tap, which would
  // otherwise snap the parallax to whatever the first touch point was and
  // leave it there (no mouseleave ever follows on touch).
  const interactiveRef = useRef(
    typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );

  function onMouseMove(event: MouseEvent<HTMLElement>) {
    if (!interactiveRef.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTilt({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    });
  }

  function onMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden px-6 py-24 sm:py-32"
      style={{ background: "var(--gradient-hero)" }}
    >
      {ORB_DEPTH.map((orb, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: "top" in orb ? orb.top : undefined,
            bottom: "bottom" in orb ? orb.bottom : undefined,
            left: "left" in orb ? orb.left : undefined,
            right: "right" in orb ? orb.right : undefined,
            transform: `translate(${tilt.x * orb.x}px, ${tilt.y * orb.y}px)`,
            transition: "transform .6s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <div
            className="hero-orb-drift rounded-full blur-3xl"
            style={{
              width: orb.size,
              height: orb.size,
              background: orb.color,
              opacity: orb.opacity,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        </div>
      ))}

      {/* Soft cursor-following spotlight -- a fixed radial-gradient graphic
          that translates (not one whose gradient stops are recalculated
          every frame), so the only property animating is `transform`. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1/4"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%)",
          transform: `translate(${tilt.x * 70}px, ${tilt.y * 70}px)`,
          transition: "transform .6s cubic-bezier(.22,1,.36,1)",
        }}
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="text-xs font-bold tracking-[0.25em] text-[var(--color-mist)] uppercase">
            {kicker}
          </span>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mt-3 text-balance font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="mx-auto mt-5 max-w-[52ch] text-white/90">{body}</p>
        </Reveal>
        <Reveal delay={270}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.25}>
              <Button
                href={registerHref}
                variant="primary"
                style={{ background: "var(--gradient-cta-gold)", color: "#16121a" }}
              >
                {registerCta}
              </Button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Button
                href={scheduleHref}
                variant="primary"
                className="shadow-none"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                {scheduleCta}
              </Button>
            </Magnetic>
          </div>
        </Reveal>
        {comingSoonNote && (
          <Reveal delay={330}>
            <p className="mx-auto mt-6 max-w-md rounded-2xl bg-white/12 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm">
              {comingSoonNote}
            </p>
          </Reveal>
        )}
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <span className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-white/40 pt-1.5">
          <span className="scroll-indicator-line h-2 w-1 rounded-full bg-white/70" />
        </span>
      </div>
    </section>
  );
}
