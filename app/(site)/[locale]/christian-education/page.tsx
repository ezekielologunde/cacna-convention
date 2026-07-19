import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { AgendaTable } from "@/components/schedule/AgendaTable";
import { christianEducation, christianEducationAgenda } from "@/lib/content/christian-education-program";

export default async function ChristianEducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ChristianEducation");

  return (
    <>
      <PageHero
        eyebrow={`${t("themeLabel")}: "${christianEducation.theme}" (${christianEducation.themeVerse})`}
        title={christianEducation.title}
        subtitle={`${t("moderatorLabel")}: ${christianEducation.moderator}`}
        variant="split"
        stat={{ label: t("dateLabel"), value: christianEducation.date }}
      />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <section>
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("orderHeading")}</h2>
          <div className="mt-4">
            <AgendaTable
              items={christianEducationAgenda}
              timeLabel={t("timeLabel")}
              programLabel={t("programLabel")}
              speakerLabel={t("speakerLabel")}
            />
          </div>
        </section>
      </div>
    </>
  );
}
