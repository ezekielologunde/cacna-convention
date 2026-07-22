import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getScheduleForEdition } from "@/lib/schedule";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import type { Audience } from "@/components/schedule/ScheduleDay";
import { PromoBanner } from "@/components/register/PromoBanner";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Schedule" });
  return pageMetadata({
    locale, path: "/schedule", title: t("title"),
    description: "The day-by-day schedule for the CACNA Annual Convention at CAC Village, Blue Ridge Summit, PA.",
  });
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Schedule");

  const supabase = await createClient();
  const edition = await getActiveEdition(supabase);

  let nextDeadline: string | null = null;
  let priceBeforeIncrease: number | null = null;

  if (edition) {
    const tiers = await getActivePricingForEdition(supabase, edition.id);
    const adultTier = tiers.find((tier) => tier.category === "adult");
    if (adultTier) {
      nextDeadline = adultTier.ends_on;
      priceBeforeIncrease = adultTier.price_cents;
    }
  }

  if (!edition) {
    return (
      <div>
        <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-4 max-w-[48ch] text-[var(--color-muted)]">{t("noEdition")}</p>
        </div>
      </div>
    );
  }

  const sessions = await getScheduleForEdition(supabase, edition.id);
  const byDay = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const existing = byDay.get(session.day_date) ?? [];
    existing.push(session);
    byDay.set(session.day_date, existing);
  }

  // `Map` iterates keys in first-insertion order, not sorted order, so this
  // only lands in chronological order by coincidence of `getScheduleForEdition`'s
  // own `ORDER BY day_date` clause. Sort explicitly here so the page's own
  // grouping logic guarantees day order rather than silently depending on
  // the query never changing.
  const orderedDays = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayDate, daySessions]) => ({
      dayDate,
      // `audience` is stored as a plain Postgres text[] -- the DB-level check
      // constraint (see supabase/migrations/0011_schedule_sessions_audience.sql)
      // guarantees the narrower Audience union at runtime, TypeScript just
      // can't see that from the generated column type.
      sessions: daySessions.map((session) => ({
        ...session,
        audience: session.audience as Audience[],
      })),
    }));

  return (
    <div>
      <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />
      <PageHero title={t("title")} photoSrc="/photos/gallery/IMG-20250719-WA0041.jpg" />
      <div className="mx-auto w-full max-w-[clamp(20rem,90vw,60rem)] px-6 py-12">
        <ScheduleView days={orderedDays} />
      </div>
    </div>
  );
}
