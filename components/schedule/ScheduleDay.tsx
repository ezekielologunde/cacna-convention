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

  return (
    <section className="py-6">
      <h2 className="text-lg font-semibold">{dayDate}</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {sessions.map((session) => (
          <li key={session.id} className="border-b border-[var(--color-border)] pb-4">
            <p className="text-sm text-[var(--color-muted)]">
              {session.starts_at.slice(0, 5)}–{session.ends_at.slice(0, 5)}
            </p>
            <p className="font-medium">{session.title}</p>
            <p className="text-sm text-[var(--color-muted)]">
              <span>{session.minister_name ?? t("guestMinister")}</span>
              {session.minister_title ? ` — ${session.minister_title}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
