import type { AgendaItem } from "@/lib/content/types";

/**
 * One shared agenda presentation, replacing the previous split between raw
 * <table> markup (Business Group, Christian Education) and flat <ul> lists
 * (CACMA, Good Women, Ministers' Wives, Youth) for the exact same
 * `AgendaItem[]` shape. Every sub-conference program page now renders its
 * agenda the same way.
 */
export function AgendaTable({
  items,
  timeLabel,
  programLabel,
  speakerLabel,
}: {
  items: AgendaItem[];
  timeLabel: string;
  programLabel: string;
  speakerLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
            <th className="px-4 py-3">{timeLabel}</th>
            <th className="px-4 py-3">{programLabel}</th>
            <th className="px-4 py-3">{speakerLabel}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-[var(--color-border)] last:border-b-0">
              <td className="px-4 py-3 tabular-nums text-[var(--color-muted)]">{item.time ?? "—"}</td>
              <td className="px-4 py-3 font-semibold text-[var(--color-fg)]">{item.event}</td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{item.speaker ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
