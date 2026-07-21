import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { RegisterCta } from "@/components/register/RegisterCta";
import { AgendaTable } from "@/components/schedule/AgendaTable";
import { cacmaSchedule } from "@/lib/content/cacma-program";
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
      <PageHero title={t("title")} />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-4xl">
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
      <RegisterCta locale={locale} />
    </>
  );
}
