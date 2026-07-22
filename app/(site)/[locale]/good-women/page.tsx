import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { RegisterCta } from "@/components/register/RegisterCta";
import { AgendaTimeline } from "@/components/schedule/AgendaTimeline";
import { PersonCard } from "@/components/ui/PersonCard";
import { goodWomenConference, goodWomenSchedule, goodWomenExecutives } from "@/lib/content/good-women-conference";
import { mainGalleryPhotos } from "@/lib/content/gallery";
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
      {/* tone (default "red"): Good Women is a family/nurture ministry,
          grouped with Children and Ministers' Wives -- blue is reserved
          for the structured/institutional ministries (CACMA, Business
          Group, Youth, Christian Education). */}
      <PageHero
        title={t("title")}
        subtitle={`${t("leaderLabel")}: ${goodWomenConference.leader} — ${goodWomenConference.leaderTitle}`}
        icon={Sparkles}
        photoSrc="/photos/gallery/IMG-20250719-WA0046.jpg"
      />
      <PhotoStrip photos={mainGalleryPhotos.slice(9, 12)} caption="From the 2025 convention" />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-5xl">
        <p className="text-sm font-semibold text-[var(--color-red-text)]">{goodWomenConference.donationHighlight}</p>

        <section className="mt-10">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executivesHeading")}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {goodWomenExecutives.map((member) => (
              <PersonCard key={member.name} name={member.name} role={member.role} />
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
                <AgendaTimeline
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
      <RegisterCta locale={locale} />
    </>
  );
}
