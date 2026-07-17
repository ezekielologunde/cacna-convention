import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getScheduleForEdition } from "@/lib/schedule";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { ScheduleDay } from "@/components/schedule/ScheduleDay";
import { PromoBanner } from "@/components/register/PromoBanner";

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
      <div className="px-6 py-12">
        <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{t("noEdition")}</p>
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
  const orderedDays = Array.from(byDay.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="px-6 py-12">
      <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      {orderedDays.map(([dayDate, daySessions]) => (
        <ScheduleDay key={dayDate} dayDate={dayDate} sessions={daySessions} />
      ))}
    </div>
  );
}
