import { getTranslations, setRequestLocale } from "next-intl/server";
import { ministersWivesConference, ministersWivesSchedule } from "@/lib/content/ministers-wives-conference";

export default async function MinistersWivesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MinistersWives");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>

      <section className="mt-8">
        <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executiveHeading")}</h2>
        <ul className="mt-3 flex flex-col gap-1 text-sm text-[var(--color-fg)]">
          {ministersWivesConference.executiveMembers.map((m) => (
            <li key={m.name}>{m.name}{m.role && ` — ${m.role}`}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 flex flex-col gap-6">
        {ministersWivesSchedule.map((session) => (
          <div
            key={session.dayLabel}
            className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
          >
            <h2 className="font-display text-lg text-[var(--color-fg)]">
              {session.dayLabel} · {session.timeRange}
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
                    <th className="py-2 pr-4">{t("timeLabel")}</th>
                    <th className="py-2 pr-4">{t("eventLabel")}</th>
                    <th className="py-2">{t("speakerLabel")}</th>
                  </tr>
                </thead>
                <tbody>
                  {session.agenda.map((item, i) => (
                    <tr key={i} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="py-2 pr-4 tabular-nums text-[var(--color-muted)]">{item.time}</td>
                      <td className="py-2 pr-4 font-semibold text-[var(--color-fg)]">{item.event}</td>
                      <td className="py-2 text-[var(--color-muted)]">{item.speaker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
