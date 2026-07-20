import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "coral" | "teal";
  className?: string;
}) {
  const toneClass = {
    neutral: "bg-[var(--color-surface)] text-[var(--color-muted)]",
    coral: "bg-[var(--color-coral-light)] text-[var(--color-coral-text)]",
    teal: "bg-[var(--color-teal-light)] text-[var(--color-teal-text)]",
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
