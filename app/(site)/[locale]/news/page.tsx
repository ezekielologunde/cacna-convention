import { getTranslations, setRequestLocale } from "next-intl/server";
import { newsEvents } from "@/lib/content/news-events";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("News");

  // Anchored at noon UTC (not `new Date(dateStr)` at midnight) so a
  // negative-offset timezone reading this at render time can't roll the
  // date back a day — same reasoning as ScheduleDay's weekday label.
  const dateFormatter = new Intl.DateTimeFormat(locale === "yo" ? "yo-NG" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-[52ch] text-[var(--color-muted)]">{t("intro")}</p>

      <ul className="mt-8 flex flex-col gap-4">
        {newsEvents.map((event) => (
          <li
            key={event.title}
            className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
          >
            <p className="text-sm font-semibold tabular-nums text-[var(--color-maroon)]">
              {dateFormatter.format(new Date(`${event.date}T12:00:00Z`))}
            </p>
            <h2 className="mt-1 font-display text-xl text-[var(--color-fg)]">{event.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{event.location}</p>
            <p className="mt-2 text-[var(--color-muted)]">{event.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
