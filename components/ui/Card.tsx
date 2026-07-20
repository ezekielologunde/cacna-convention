import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  hoverable = false,
  padding = "md",
  className = "",
  ...rest
}: {
  children: ReactNode;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg";
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const paddingClass = { sm: "p-4", md: "p-6", lg: "p-8 sm:p-10" }[padding];
  return (
    <div
      className={[
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-card)]",
        paddingClass,
        hoverable ? "transition-transform duration-300 hover:-translate-y-1" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
