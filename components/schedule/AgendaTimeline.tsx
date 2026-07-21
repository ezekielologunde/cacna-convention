import { Mic2 } from "lucide-react";
import type { AgendaItem } from "@/lib/content/types";

/**
 * Card-based replacement for the flat AgendaTable — same `AgendaItem[]`
 * shape, rendered as a connected vertical timeline instead of a table row
 * grid. `tone` picks the rail/dot/time accent so each sub-conference page
 * can carry its own red or blue identity without inventing new colors
 * outside the site's audited token set.
 */
export function AgendaTimeline({
  items,
  timeLabel,
  speakerLabel,
  tone = "red",
}: {
  items: AgendaItem[];
  timeLabel: string;
  programLabel: string;
  speakerLabel: string;
  tone?: "red" | "blue";
}) {
  const dot = tone === "blue" ? "var(--color-blue)" : "var(--color-red)";
  const accentText = tone === "blue" ? "var(--color-blue-text)" : "var(--color-red-text)";

  return (
    <ol className="relative flex flex-col gap-4 border-l-2 border-[var(--color-border)] pl-6 sm:pl-8">
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-5 -left-[calc(1.5rem+5px)] h-2.5 w-2.5 rounded-full ring-4 ring-[var(--color-bg)] sm:-left-[calc(2rem+5px)]"
            style={{ background: dot }}
          />
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-lg sm:p-5">
            <span
              className="text-xs font-bold tracking-wide uppercase tabular-nums"
              style={{ color: accentText }}
            >
              <span className="sr-only">{timeLabel}: </span>
              {item.time ?? "—"}
            </span>
            <p className="mt-1.5 font-display text-base font-bold text-[var(--color-fg)] sm:text-lg">
              {item.event}
            </p>
            {item.speaker && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
                <Mic2 aria-hidden="true" size={14} strokeWidth={2.25} className="shrink-0" />
                <span className="sr-only">{speakerLabel}: </span>
                {item.speaker}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
