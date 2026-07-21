import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { newsEvents } from "@/lib/content/news-events";
import { getCacWorldNews, getCacnorthBlogPosts, getCacnorthEvents } from "@/lib/cacnorth-content";

// Without this, the CAC World/blog sections below would freeze at
// whatever they were during the last deploy -- this page has no other
// dynamic dependency, so it would otherwise be fully static. An hourly
// revalidation keeps it reasonably fresh without a live DB round-trip on
// every request.
export const revalidate = 3600;

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("News");

  // All three queries hit cacnorthamerica.com's separate Supabase project
  // (see lib/cacnorth-supabase.ts) -- independent of this page's own
  // edition/registration data, so failures there shouldn't take down the
  // whole page. cac_world_news has real published rows today; blog_posts
  // and events are wired up but currently empty (see lib/cacnorth-content.ts)
  // and simply render nothing until that changes.
  const [cacWorldNews, blogPosts, cacnorthEvents] = await Promise.all([
    getCacWorldNews().catch(() => []),
    getCacnorthBlogPosts().catch(() => []),
    getCacnorthEvents().catch(() => []),
  ]);

  const blogDateFormatter = new Intl.DateTimeFormat(locale === "yo" ? "yo-NG" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
            <p className="text-sm font-semibold tabular-nums text-[var(--color-coral-text)]">
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
                className="mt-3 inline-block text-sm font-semibold text-[var(--color-coral-text)] underline"
              >
                {t("moreInfoCta")}
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      {cacnorthEvents.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-[var(--color-fg)]">{t("fromEventsHeading")}</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {cacnorthEvents.map((event) => (
              <li
                key={event.id}
                className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
              >
                <p className="text-sm font-semibold tabular-nums text-[var(--color-coral-text)]">
                  {dateFormatter.format(new Date(event.eventDate))}
                  {event.endDate ? ` – ${dateFormatter.format(new Date(event.endDate))}` : null}
                </p>
                <h3 className="mt-1 font-display text-xl text-[var(--color-fg)]">{event.title}</h3>
                {event.location ? (
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{event.location}</p>
                ) : null}
                {event.description ? (
                  <p className="mt-2 text-[var(--color-muted)]">{event.description}</p>
                ) : null}
                {event.eventUrl ? (
                  <a
                    href={event.eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("moreInfoCta")}${t("opensInNewTab")}`}
                    className="mt-3 inline-block text-sm font-semibold text-[var(--color-coral-text)] underline"
                  >
                    {t("moreInfoCta")}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {blogPosts.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-[var(--color-fg)]">{t("fromBlogHeading")}</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {blogPosts.map((post) => (
              <li key={post.id}>
                <Card hoverable padding="sm">
                  <a
                    href={`https://cacnorthamerica.com/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${post.title}${t("opensInNewTab")}`}
                    className="flex gap-4"
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="h-20 w-20 flex-none rounded-xl object-cover"
                      />
                    ) : null}
                    <span className="min-w-0">
                      <Badge tone="coral">{t("cacnaBlogLabel")}</Badge>
                      <span className="mt-1 block font-display text-lg text-[var(--color-fg)]">
                        {post.title}
                      </span>
                      {post.excerpt ? (
                        <span className="mt-1 block text-sm text-[var(--color-muted)]">{post.excerpt}</span>
                      ) : null}
                      {post.publishedAt ? (
                        <span className="mt-1 block text-xs font-semibold tabular-nums text-[var(--color-coral-text)]">
                          {blogDateFormatter.format(new Date(post.publishedAt))}
                        </span>
                      ) : null}
                    </span>
                  </a>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cacWorldNews.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-[var(--color-fg)]">{t("fromCacWorldHeading")}</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{t("fromCacWorldIntro")}</p>
          <ul className="mt-4 flex flex-col gap-4">
            {cacWorldNews.map((item) => (
              <li key={item.id}>
                <Card hoverable padding="sm">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.title}${t("opensInNewTab")}`}
                    className="flex gap-4"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-20 w-20 flex-none rounded-xl object-cover"
                      />
                    ) : null}
                    <span className="min-w-0">
                      <Badge tone="teal">{t("cacWorldLabel")}</Badge>
                      <span className="mt-1 block font-display text-lg text-[var(--color-fg)]">
                        {item.title}
                      </span>
                      {item.excerpt ? (
                        <span className="mt-1 block text-sm text-[var(--color-muted)]">{item.excerpt}</span>
                      ) : null}
                      {item.publishedAt ? (
                        <span className="mt-1 block text-xs font-semibold tabular-nums text-[var(--color-teal-text)]">
                          {blogDateFormatter.format(new Date(item.publishedAt))}
                        </span>
                      ) : null}
                    </span>
                  </a>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      </div>
    </>
  );
}
