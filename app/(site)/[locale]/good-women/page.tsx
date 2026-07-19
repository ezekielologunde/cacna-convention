import { getTranslations, setRequestLocale } from "next-intl/server";
import { goodWomenConference, goodWomenSchedule, goodWomenExecutives } from "@/lib/content/good-women-conference";

export default async function GoodWomenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("GoodWomen");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>

      <p className="mt-4 text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-fg)]">{t("leaderLabel")}: </span>
        {goodWomenConference.leader} — {goodWomenConference.leaderTitle}
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executivesHeading")}</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {goodWomenExecutives.map((member) => (
            <li
              key={member.name}
              className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
            >
              <p className="font-semibold text-[var(--color-fg)]">{member.name}</p>
              {member.role && (
                <p className="mt-1 text-sm text-[var(--color-muted)]">{member.role}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 flex flex-col gap-6">
        {goodWomenSchedule.map((session, i) => (
          <div
            key={`${session.dayLabel}-${i}`}
            className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
          >
            <h2 className="font-display text-lg text-[var(--color-fg)]">
              {session.dayLabel} · {session.timeRange}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {session.agenda.map((item, j) => (
                <li key={j} className="text-sm text-[var(--color-fg)]">
                  {item.time && (
                    <span className="mr-2 font-semibold tabular-nums text-[var(--color-muted)]">{item.time}</span>
                  )}
                  {item.event}
                  {item.speaker && <span className="text-[var(--color-muted)]"> — {item.speaker}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
