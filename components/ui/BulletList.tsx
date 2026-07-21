/**
 * Shared red-dot bullet list used by the About and Plan Your Visit pages.
 *
 * Plain function component (no client-only hooks) so it can be imported by
 * both a "use client" component (AboutTabs) and a server component
 * (plan-your-visit/page.tsx).
 */
export function BulletList({
  items,
  className = "",
  itemClassName = "",
}: {
  items: string[];
  /** Extra classes appended to the `<ul>`, e.g. gap and text color/size. */
  className?: string;
  /** Extra classes appended to each `<li>`, e.g. text color/size. */
  itemClassName?: string;
}) {
  return (
    <ul className={["mt-2 flex flex-col", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item} className={["flex gap-2.5", itemClassName].filter(Boolean).join(" ")}>
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: "var(--color-red-deep)" }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
