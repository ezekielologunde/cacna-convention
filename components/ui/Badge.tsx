import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "red" | "blue" | "gold";
  className?: string;
}) {
  const toneClass = {
    neutral: "bg-[var(--color-surface)] text-[var(--color-muted)]",
    red: "bg-[var(--color-red-light)] text-[var(--color-red-text)]",
    blue: "bg-[var(--color-blue-light)] text-[var(--color-blue-text)]",
    // Gold fill + dark text -- the same safe pairing already used by the
    // footer's Register button. Gold text/outline on white fails contrast
    // (~1.5:1), so this tone is deliberately fill-only, safe on any
    // background rather than needing a dark-surface caveat like most gold
    // usage elsewhere on this site.
    gold: "bg-[var(--color-gold)] text-[#16121a]",
  }[tone];
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
        toneClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
