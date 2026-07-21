"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 to `value` once the element scrolls into view. Runs on
 * a plain rAF loop (no motion library). Fires once (like Reveal.tsx),
 * jumps straight to the final value under prefers-reduced-motion.
 */
export function CountUp({
  value,
  duration = 1200,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const reduceRef = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reduceRef.current) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        // Counts rAF ticks rather than diffing wall-clock timestamps --
        // some test/polyfill rAF implementations hand their callback a
        // timestamp on a different clock epoch than performance.now(),
        // which produced wildly wrong (even negative) progress when the
        // two were diffed. A fixed frame budget (~60fps) is immune to
        // that and still reads as the same duration in a real browser.
        const totalFrames = Math.max(1, Math.round((duration / 1000) * 60));
        let frame = 0;
        function tick() {
          frame += 1;
          const progress = Math.min(1, frame / totalFrames);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
