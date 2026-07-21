import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { AgendaTable } from "@/components/schedule/AgendaTable";
import { goodWomenConference, goodWomenSchedule, goodWomenExecutives } from "@/lib/content/good-women-conference";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GoodWomen" });
  return pageMetadata({
    locale, path: "/good-women", title: t("title"),
    description: `Schedule and executive committee for the Good Women Association Conference, led by ${goodWomenConference.leader}, at the CACNA Annual Convention.`,
  });
}

export default async function GoodWomenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("GoodWomen");

  return (
    <>
      <PageHero
        title={t("title")}
        subtitle={`${t("leaderLabel")}: ${goodWomenConference.leader} — ${goodWomenConference.leaderTitle}`}
      />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <section>
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executivesHeading")}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
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

        <section className="mt-10 flex flex-col gap-8">
          {goodWomenSchedule.map((session, i) => (
            <div key={`${session.dayLabel}-${i}`}>
              <h2 className="font-display text-lg text-[var(--color-fg)]">
                {session.dayLabel} · {session.timeRange}
              </h2>
              <div className="mt-3">
                <AgendaTable
                  items={session.agenda}
                  timeLabel={t("timeLabel")}
                  programLabel={t("programLabel")}
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
