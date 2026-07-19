import { getTranslations, setRequestLocale } from "next-intl/server";
import { youthProgram, youthSchedule } from "@/lib/content/youth-program";

export default async function YouthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Youth");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{youthProgram.title}</h1>

      <div className="mt-4 flex flex-col gap-1 text-sm text-[var(--color-muted)]">
        <p>
          <span className="font-semibold text-[var(--color-fg)]">{t("themeLabel")}: </span>
          &ldquo;{youthProgram.theme}&rdquo;
        </p>
        <p>
          <span className="font-semibold text-[var(--color-fg)]">{t("coordinatorLabel")}: </span>
          {youthProgram.regionalCoordinator}
        </p>
      </div>

      <section className="mt-10 flex flex-col gap-6">
        {youthSchedule.map((day) => (
          <div
            key={day.dayLabel}
            className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
          >
            <h2 className="font-display text-lg text-[var(--color-fg)]">{day.dayLabel}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {day.agenda.map((item, i) => (
                <li key={i} className="text-sm text-[var(--color-fg)]">
                  <span className="mr-2 font-semibold tabular-nums text-[var(--color-muted)]">{item.time}</span>
                  {item.event}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
