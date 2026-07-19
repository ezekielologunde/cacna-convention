import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
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
    <>
      <PageHero title={t("title")} subtitle={t("intro")} />
      <div className="mx-auto max-w-3xl px-6 py-12">
      <ul className="flex flex-col gap-4">
        {newsEvents.map((event) => (
          <li
            key={event.title}
            className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
          >
            <p className="text-sm font-semibold tabular-nums text-[var(--color-maroon)]">
              {dateFormatter.format(new Date(`${event.date}T12:00:00Z`))}
              {event.endDate
                ? ` – ${dateFormatter.format(new Date(`${event.endDate}T12:00:00Z`))}`
                : null}
            </p>
            <h2 className="mt-1 font-display text-xl text-[var(--color-fg)]">{event.title}</h2>
            {event.location ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{event.location}</p>
            ) : null}
            <p className="mt-2 text-[var(--color-muted)]">{event.description}</p>
            {event.highlights ? (
              <ul className="mt-2 flex flex-col gap-1">
                {event.highlights.map((highlight) => (
                  <li key={highlight} className="text-sm text-[var(--color-muted)]">
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : null}
            {event.moreInfoUrl ? (
              <a
                href={event.moreInfoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("moreInfoCta")}${t("opensInNewTab")}`}
                className="mt-3 inline-block text-sm font-semibold text-[var(--color-maroon)] underline"
              >
                {t("moreInfoCta")}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      </div>
    </>
  );
}
