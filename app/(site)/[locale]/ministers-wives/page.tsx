import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { AgendaTable } from "@/components/schedule/AgendaTable";
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
    <>
      <PageHero title={t("title")} />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <section>
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executiveHeading")}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {ministersWivesConference.executiveMembers.map((member) => (
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

        <section className="mt-10 flex flex-col gap-8">
          {ministersWivesSchedule.map((session) => (
            <div key={session.dayLabel}>
              <h2 className="font-display text-lg text-[var(--color-fg)]">
                {session.dayLabel} · {session.timeRange}
              </h2>
              <div className="mt-3">
                <AgendaTable
                  items={session.agenda}
                  timeLabel={t("timeLabel")}
                  programLabel={t("eventLabel")}
                  speakerLabel={t("speakerLabel")}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
