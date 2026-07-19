import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { AgendaTable } from "@/components/schedule/AgendaTable";
import { cacmaSchedule } from "@/lib/content/cacma-program";

export default async function CacmaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cacma");

  return (
    <>
      <PageHero title={t("title")} />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <section className="flex flex-col gap-8">
          {cacmaSchedule.map((session, i) => (
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
