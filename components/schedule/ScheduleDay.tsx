"use client";

import { useTranslations } from "next-intl";

type SessionSummary = {
  id: string;
  starts_at: string;
  ends_at: string;
  title: string;
  minister_name: string | null;
  minister_title: string | null;
};

export function ScheduleDay({
  dayDate,
  sessions,
}: {
  dayDate: string;
  sessions: SessionSummary[];
}) {
  const t = useTranslations("Schedule");

  // Parsed with a noon UTC anchor (not `new Date(dayDate)` at midnight) so a
  // negative-offset timezone reading this at render time can't roll the
  // weekday back a day — a friendly label is worthless if it names the
  // wrong day.
  const weekday = new Date(`${dayDate}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });

  return (
    <section className="rounded-3xl border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)] sm:p-7">
      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white uppercase" style={{ background: "var(--gradient-cta)" }}>
        {weekday}
      </span>
      <h2 className="sr-only">{dayDate}</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {sessions.map((session) => (
          <li key={session.id} className="border-b border-[var(--color-border)] pb-4 last:border-b-0 last:pb-0">
            <p className="text-sm font-semibold text-[var(--color-red-text)] tabular-nums">
              {session.starts_at.slice(0, 5)}–{session.ends_at.slice(0, 5)}
            </p>
            <p className="mt-0.5 font-semibold text-[var(--color-fg)]">{session.title}</p>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">
              <span>{session.minister_name ?? t("guestMinister")}</span>
              {session.minister_title ? ` — ${session.minister_title}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
