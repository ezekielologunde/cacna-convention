import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Flame } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { RegisterCta } from "@/components/register/RegisterCta";
import { AgendaTimeline } from "@/components/schedule/AgendaTimeline";
import { youthProgram, youthSchedule } from "@/lib/content/youth-program";
import { mainGalleryPhotos } from "@/lib/content/gallery";
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
      {/* tone="blue": Youth is a structured/institutional ministry, grouped
          with CACMA, Business Group, and Christian Education -- red is
          reserved for the family/nurture ministries (Children, Good Women,
          Ministers' Wives). */}
      <PageHero
        eyebrow={`${t("themeLabel")}: "${youthProgram.theme}"`}
        title={youthProgram.title}
        subtitle={`${t("coordinatorLabel")}: ${youthProgram.regionalCoordinator}`}
        tone="blue"
        icon={Flame}
        photoSrc="/photos/gallery/IMG-20250719-WA0042.jpg"
      />
      <PhotoStrip photos={mainGalleryPhotos.slice(0, 3)} caption="From the 2025 convention" />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-5xl">
        <section className="pb-10">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("historyHeading")}</h2>
          <p className="mt-3 text-sm text-[var(--color-muted)]">{youthProgram.history}</p>
        </section>
        <section className="flex flex-col gap-8">
          {youthSchedule.map((day) => (
            <div key={day.dayLabel}>
              <h2 className="font-display text-lg text-[var(--color-fg)]">{day.dayLabel}</h2>
              <div className="mt-3">
                <AgendaTimeline
                  items={day.agenda}
                  timeLabel={t("timeLabel")}
                  programLabel={t("programLabel")}
                  speakerLabel={t("speakerLabel")}
                  tone="blue"
                />
              </div>
            </div>
          ))}
        </section>
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
