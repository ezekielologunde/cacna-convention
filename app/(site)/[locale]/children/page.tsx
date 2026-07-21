import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import {
  childrenConvention,
  dailyStructure,
  childrenSchedule,
  childrenTeachers,
} from "@/lib/content/children-convention";
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
      <PageHero
        eyebrow={`${t("themeLabel")}: "${childrenConvention.theme}" (${childrenConvention.themeVerse})`}
        title={t("title")}
        subtitle={`${t("coordinatorLabel")}: ${childrenConvention.coordinator}`}
      />
      <div className="mx-auto max-w-3xl px-6 py-12">
      <section className="mt-2">
        <h2 className="font-display text-xl text-[var(--color-fg)]">
          {t("dailyStructureHeading")}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
                <th className="px-4 py-3">{t("scheduleHeading")}</th>
                <th className="px-4 py-3">{t("morningLabel")}</th>
                <th className="px-4 py-3">{t("afternoonLabel")}</th>
              </tr>
            </thead>
            <tbody>
              {dailyStructure.map((row) => (
                <tr key={row.label} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-[var(--color-fg)]">{row.label}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)] tabular-nums">{row.morning}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)] tabular-nums">{row.afternoon}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                    <p className="text-xs font-bold tracking-wide text-[var(--color-coral-text)] uppercase">
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
        <ul className="mt-4 grid gap-x-6 gap-y-1.5 text-sm text-[var(--color-fg)] sm:grid-cols-2">
          {childrenTeachers.map((teacher) => (
            <li key={teacher.name}>
              {teacher.name}
              {teacher.ageRange && (
                <span className="text-[var(--color-muted)]"> — {teacher.ageRange}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm font-semibold text-[var(--color-coral-text)]">
        {childrenConvention.safetyNote}
      </p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{childrenConvention.closingNote}</p>
      </div>
    </>
  );
}
