/**
 * Upgrades the flat "Name / role" `<li>` used for executive-committee lists
 * (Business Group, Good Women, Ministers' Wives) into an avatar-initial
 * card. No photos exist for these roles, so the initials chip carries the
 * card's visual weight instead of an empty image placeholder.
 */
export function PersonCard({
  name,
  role,
  tone = "red",
}: {
  name: string;
  role?: string;
  tone?: "red" | "blue";
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const gradient =
    tone === "blue"
      ? "linear-gradient(150deg, var(--color-blue) 0%, var(--color-blue-deep) 100%)"
      : "linear-gradient(150deg, var(--color-red) 0%, var(--color-red-deep) 100%)";
  const accentText = tone === "blue" ? "var(--color-blue-text)" : "var(--color-red-text)";

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-lg">
      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-white"
        style={{ background: gradient }}
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--color-fg)]">{name}</p>
        {role && (
          <p
            className="mt-0.5 text-xs font-bold tracking-wide uppercase"
            style={{ color: accentText }}
          >
            {role}
          </p>
        )}
      </div>
    </li>
  );
}
