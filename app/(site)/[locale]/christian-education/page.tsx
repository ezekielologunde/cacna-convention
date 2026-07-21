import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { RegisterCta } from "@/components/register/RegisterCta";
import { AgendaTable } from "@/components/schedule/AgendaTable";
import { christianEducation, christianEducationAgenda } from "@/lib/content/christian-education-program";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale, path: "/christian-education", title: christianEducation.title,
    description: `Theme: "${christianEducation.theme}" — the Christian Education program at the CACNA Annual Convention, ${christianEducation.date}.`,
  });
}

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
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-4xl">
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
      <RegisterCta locale={locale} />
    </>
  );
}
