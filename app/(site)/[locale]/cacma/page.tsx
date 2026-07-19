import { getTranslations, setRequestLocale } from "next-intl/server";
import { cacmaSchedule } from "@/lib/content/cacma-program";

export default async function CacmaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cacma");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>

      <section className="mt-10 flex flex-col gap-6">
        {cacmaSchedule.map((session, i) => (
          <div
            key={`${session.dayLabel}-${i}`}
            className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
          >
            <h2 className="font-display text-lg text-[var(--color-fg)]">
              {session.dayLabel} · {session.timeRange}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {session.agenda.map((item, j) => (
                <li key={j} className="text-sm text-[var(--color-fg)]">
                  <span className="mr-2 font-semibold tabular-nums text-[var(--color-muted)]">{item.time}</span>
                  {item.event}
                  {item.speaker && <span className="text-[var(--color-muted)]"> — {item.speaker}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
