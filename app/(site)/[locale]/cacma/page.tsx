import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { RegisterCta } from "@/components/register/RegisterCta";
import { AgendaTimeline } from "@/components/schedule/AgendaTimeline";
import { cacmaSchedule, cacmaLeader } from "@/lib/content/cacma-program";
import { mainGalleryPhotos } from "@/lib/content/gallery";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cacma" });
  return pageMetadata({
    locale, path: "/cacma", title: t("title"),
    description: "Schedule for the CAC Latunde Region Men Association (CACMA) at the CACNA Annual Convention.",
  });
}

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
      {/* tone="blue": CACMA is a structured/institutional ministry (men's
          fellowship & administration), grouped with Business Group, Youth,
          and Christian Education -- red is reserved for the family/nurture
          ministries (Children, Good Women, Ministers' Wives). See the same
          comment on those pages for the full rule. */}
      <PageHero
        title={t("title")}
        subtitle={`${t("leaderLabel")}: ${cacmaLeader}`}
        tone="blue"
        icon={ShieldCheck}
        photoSrc="/photos/gallery/IMG-20250719-WA0043.jpg"
      />
      <PhotoStrip photos={mainGalleryPhotos.slice(3, 6)} caption="From the 2025 convention" />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-5xl">
        <section className="flex flex-col gap-8">
          {cacmaSchedule.map((session, i) => (
            <div key={`${session.dayLabel}-${i}`}>
              <h2 className="font-display text-lg text-[var(--color-fg)]">
                {session.dayLabel} · {session.timeRange}
              </h2>
              <div className="mt-3">
                <AgendaTimeline
                  items={session.agenda}
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
