import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeartHandshake } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { RegisterCta } from "@/components/register/RegisterCta";
import { AgendaTimeline } from "@/components/schedule/AgendaTimeline";
import { PersonCard } from "@/components/ui/PersonCard";
import { ministersWivesConference, ministersWivesSchedule } from "@/lib/content/ministers-wives-conference";
import { mainGalleryPhotos } from "@/lib/content/gallery";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MinistersWives" });
  return pageMetadata({
    locale, path: "/ministers-wives", title: t("title"),
    description: "Schedule and executive members for the Ministers' Wives Conference at the CACNA Annual Convention.",
  });
}

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
      {/* tone="red": Ministers' Wives is a family/nurture ministry, grouped
          with Children and Good Women -- blue is reserved for the
          structured/institutional ministries (CACMA, Business Group,
          Youth, Christian Education). */}
      <PageHero title={t("title")} tone="red" icon={HeartHandshake} photoSrc="/photos/gallery/IMG-20250719-WA0048.jpg" />
      <PhotoStrip photos={mainGalleryPhotos.slice(12, 15)} caption="From the 2025 convention" />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-5xl">
        <section>
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executiveHeading")}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {ministersWivesConference.executiveMembers.map((member) => (
              <PersonCard key={member.name} name={member.name} role={member.role} tone="red" />
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
                <AgendaTimeline
                  items={session.agenda}
                  timeLabel={t("timeLabel")}
                  programLabel={t("eventLabel")}
                  speakerLabel={t("speakerLabel")}
                  tone="red"
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
