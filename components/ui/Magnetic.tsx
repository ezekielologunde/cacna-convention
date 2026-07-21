"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Hand-rolled port of the sibling cacnorthamerica.com site's `Magnetic`
 * (same prop names/behavior, no framer-motion dependency -- this project
 * stays dependency-free for motion, see Reveal.tsx's own doc comment).
 * Nudges its child toward the cursor via a CSS transition instead of a JS
 * spring; visually reads the same at this displacement scale. Renders a
 * plain span under prefers-reduced-motion (checked once via matchMedia,
 * not the CSS zeroing alone, since that doesn't stop inline transforms).
 */
export function Magnetic({
  children,
  strength = 0.3,
  className,
  style,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const reduceRef = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  if (reduceRef.current) {
    return (
      <span className={className} style={{ display: "inline-flex", ...style }}>
        {children}
      </span>
    );
  }

  function onMove(e: React.MouseEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    setPos({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength });
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: "inline-flex",
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform .35s cubic-bezier(.22,1,.36,1)",
        ...style,
      }}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
    >
      {children}
    </span>
  );
}
