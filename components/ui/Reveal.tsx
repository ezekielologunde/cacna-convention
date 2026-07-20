"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Lightweight scroll-entrance wrapper (IntersectionObserver, no animation
 * library dependency) — fades/slides content in the first time it enters
 * the viewport, then leaves it alone. Mirrors the sibling cacnorthamerica.com
 * site's `Reveal` component so both sites share the same motion language.
 * Respects prefers-reduced-motion via the project's existing global media
 * query (app/globals.css already zeroes transition durations for it).
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  style,
  className,
}: {
  children: ReactNode;
  from?: "up" | "left" | "right" | "none";
  delay?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const offset = from === "up" ? "translateY(18px)" : from === "left" ? "translateX(-18px)" : from === "right" ? "translateX(18px)" : "none";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : offset,
        transition: `opacity .6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
