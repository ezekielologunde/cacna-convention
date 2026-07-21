import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "red" | "blue";
  className?: string;
}) {
  const toneClass = {
    neutral: "bg-[var(--color-surface)] text-[var(--color-muted)]",
    red: "bg-[var(--color-red-light)] text-[var(--color-red-text)]",
    blue: "bg-[var(--color-blue-light)] text-[var(--color-blue-text)]",
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
