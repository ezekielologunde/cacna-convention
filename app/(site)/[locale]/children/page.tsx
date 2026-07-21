import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Baby, Sun, Moon } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { RegisterCta } from "@/components/register/RegisterCta";
import {
  childrenConvention,
  dailyStructure,
  childrenSchedule,
  childrenTeachers,
} from "@/lib/content/children-convention";
import { childrenGalleryPhotos } from "@/lib/content/gallery";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Children" });
  return pageMetadata({
    locale, path: "/children", title: t("title"),
    description: `Theme: "${childrenConvention.theme}" — the Children's Convention Program at the CACNA Annual Convention.`,
  });
}

export default async function ChildrenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Children");

  return (
    <>
      {/* tone (default "red"): Children is a family/nurture ministry,
          grouped with Good Women and Ministers' Wives -- blue is reserved
          for the structured/institutional ministries (CACMA, Business
          Group, Youth, Christian Education). */}
      <PageHero
        eyebrow={`${t("themeLabel")}: "${childrenConvention.theme}" (${childrenConvention.themeVerse})`}
        title={t("title")}
        subtitle={`${t("coordinatorLabel")}: ${childrenConvention.coordinator}`}
        icon={Baby}
        photoSrc="/photos/gallery/IMG-20250719-WA0051.jpg"
      />
      <PhotoStrip photos={childrenGalleryPhotos.slice(0, 3)} caption="From the Children's Department, 2025" />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-4xl">
      <section className="mt-2">
        <h2 className="font-display text-xl text-[var(--color-fg)]">
          {t("dailyStructureHeading")}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {dailyStructure.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-[var(--color-border)] p-4 shadow-[var(--shadow-card)]"
            >
              <p className="font-display text-sm font-bold text-[var(--color-fg)]">{row.label}</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <p className="flex items-center gap-2 text-[var(--color-muted)]">
                  <Sun aria-hidden="true" size={14} strokeWidth={2.25} className="shrink-0 text-[var(--color-red-text)]" />
                  <span className="sr-only">{t("morningLabel")}: </span>
                  <span className="tabular-nums">{row.morning}</span>
                </p>
                <p className="flex items-center gap-2 text-[var(--color-muted)]">
                  <Moon aria-hidden="true" size={14} strokeWidth={2.25} className="shrink-0 text-[var(--color-blue-text)]" />
                  <span className="sr-only">{t("afternoonLabel")}: </span>
                  <span className="tabular-nums">{row.afternoon}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("scheduleHeading")}</h2>
        <div className="mt-4 flex flex-col gap-4">
          {childrenSchedule.map((day) => (
            <div
              key={day.date}
              className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
            >
              <h3 className="font-display text-lg text-[var(--color-fg)]">{day.dayLabel}</h3>
              {[
                { label: t("morningLabel"), session: day.morning },
                { label: t("afternoonLabel"), session: day.afternoon },
              ]
                .filter((block) => block.session)
                .map((block) => (
                  <div key={block.label} className="mt-3">
                    <p className="text-xs font-bold tracking-wide text-[var(--color-red-text)] uppercase">
                      {block.label} · {block.session!.time}
                    </p>
                    {block.session!.message ? (
                      <p className="mt-1 text-sm text-[var(--color-fg)]">
                        &ldquo;{block.session!.message}&rdquo;
                      </p>
                    ) : null}
                    {block.session!.activity ? (
                      <p className="mt-1 text-sm text-[var(--color-fg)]">{block.session!.activity}</p>
                    ) : null}
                    {block.session!.teachersByAge ? (
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {block.session!.teachersByAge.map((group) => (
                          <li key={group.ageRange} className="text-sm text-[var(--color-muted)]">
                            <span className="font-semibold text-[var(--color-fg)]">
                              {group.ageRange}:
                            </span>{" "}
                            {group.teachers.join(", ")}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("teachersListHeading")}</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {childrenTeachers.map((teacher) => (
            <li
              key={teacher.name}
              className="rounded-full border border-[var(--color-border)] px-3.5 py-1.5 text-sm text-[var(--color-fg)]"
            >
              {teacher.name}
              {teacher.ageRange && (
                <span className="text-[var(--color-muted)]"> — {teacher.ageRange}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm font-semibold text-[var(--color-red-text)]">
        {childrenConvention.safetyNote}
      </p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{childrenConvention.closingNote}</p>
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
