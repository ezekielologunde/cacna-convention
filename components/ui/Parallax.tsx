"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Hand-rolled port of the sibling cacnorthamerica.com site's `Parallax`
 * (same prop names/behavior, no framer-motion dependency). Translates its
 * children vertically as the element scrolls through the viewport, driven
 * by a scroll listener + rAF instead of framer-motion's useScroll. Place
 * inside an `overflow: hidden` frame whose child is slightly oversized so
 * the drift never reveals an edge. Static under prefers-reduced-motion.
 */
export function Parallax({
  children,
  distance = 60,
  className,
  style,
  "aria-hidden": ariaHidden,
}: {
  children?: ReactNode;
  distance?: number;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);
  const reduceRef = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reduceRef.current) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    function update() {
      const target = ref.current;
      if (!target) return;
      const r = target.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: 0 when element's top is at viewport bottom, 1 when its
      // bottom is at viewport top -- mirrors framer-motion's
      // offset: ["start end", "end start"].
      const progress = (vh - r.top) / (vh + r.height);
      const clamped = Math.min(1, Math.max(0, progress));
      setY(distance - clamped * distance * 2);
      raf = 0;
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [distance]);

  if (reduceRef.current) {
    return (
      <div ref={ref} aria-hidden={ariaHidden} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden={ariaHidden}
      className={className}
      style={{ ...style, transform: `translateY(${y}px)`, willChange: "transform" }}
    >
      {children}
    </div>
  );
}
