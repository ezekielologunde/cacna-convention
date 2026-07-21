import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { AgendaTable } from "@/components/schedule/AgendaTable";
import { youthProgram, youthSchedule } from "@/lib/content/youth-program";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale, path: "/youth", title: youthProgram.title,
    description: `Theme: "${youthProgram.theme}" — the Youth & Young Ministry program at the CACNA Annual Convention.`,
  });
}

export default async function YouthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Youth");

  return (
    <>
      <PageHero
        eyebrow={`${t("themeLabel")}: "${youthProgram.theme}"`}
        title={youthProgram.title}
        subtitle={`${t("coordinatorLabel")}: ${youthProgram.regionalCoordinator}`}
      />
      <div className="mx-auto max-w-3xl px-6 py-12 2xl:max-w-4xl">
        <section className="pb-10">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("historyHeading")}</h2>
          <p className="mt-3 text-sm text-[var(--color-muted)]">{youthProgram.history}</p>
        </section>
        <section className="flex flex-col gap-8">
          {youthSchedule.map((day) => (
            <div key={day.dayLabel}>
              <h2 className="font-display text-lg text-[var(--color-fg)]">{day.dayLabel}</h2>
              <div className="mt-3">
                <AgendaTable
                  items={day.agenda}
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
