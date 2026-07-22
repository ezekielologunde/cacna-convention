import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { RegisterCta } from "@/components/register/RegisterCta";
import { AgendaTimeline } from "@/components/schedule/AgendaTimeline";
import { christianEducation, christianEducationAgenda } from "@/lib/content/christian-education-program";
import { mainGalleryPhotos } from "@/lib/content/gallery";
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
      {/* tone="blue": Christian Education is a structured/institutional
          ministry, grouped with CACMA, Business Group, and Youth -- red is
          reserved for the family/nurture ministries (Children, Good Women,
          Ministers' Wives). */}
      <PageHero
        eyebrow={`${t("themeLabel")}: "${christianEducation.theme}" (${christianEducation.themeVerse})`}
        title={christianEducation.title}
        subtitle={`${t("moderatorLabel")}: ${christianEducation.moderator}`}
        variant="split"
        photoSrc="/photos/gallery/IMG-20250719-WA0049.jpg"
        stat={{ label: t("dateLabel"), value: christianEducation.date }}
        tone="blue"
        icon={BookOpen}
      />
      <PhotoStrip photos={mainGalleryPhotos.slice(15, 18)} caption="From the 2025 convention" />
      <div className="mx-auto w-full max-w-[clamp(20rem,90vw,60rem)] px-6 py-12">
        <section>
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("orderHeading")}</h2>
          <div className="mt-4">
            <AgendaTimeline
              items={christianEducationAgenda}
              timeLabel={t("timeLabel")}
              programLabel={t("programLabel")}
              speakerLabel={t("speakerLabel")}
              tone="blue"
            />
          </div>
        </section>
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
