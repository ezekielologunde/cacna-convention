import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/ui/PageHero";
import { RegisterCta } from "@/components/register/RegisterCta";
import { pageMetadata } from "@/lib/metadata";
import { recurringSpeakerNote } from "@/lib/content/archive";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Archive" });
  return pageMetadata({
    locale, path: "/archive", title: t("title"),
    description: "Past CACNA Annual Convention editions — themes, dates, and session counts.",
  });
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Archive");

  const supabase = await createClient();
  const { data: editions } = await supabase
    .from("convention_editions")
    .select("id, year, theme, starts_on, ends_on")
    .eq("status", "past")
    .order("year", { ascending: false });

  // Fee tiers vary by registration date (early-bird through at-the-door), so
  // most editions show a min–max range rather than one fixed price. Fetched
  // in one query across every past edition rather than per-row, since only a
  // handful of editions will ever have this data (older years' fees weren't
  // digitized).
  const editionIds = editions?.map((e) => e.id) ?? [];
  const { data: tiers } = editionIds.length
    ? await supabase
        .from("pricing_tiers")
        .select("edition_id, category, price_cents")
        .in("edition_id", editionIds)
    : { data: null };

  const feesByEdition = new Map<string, Record<"adult" | "young_adult" | "child", { min: number; max: number }>>();
  for (const tier of tiers ?? []) {
    const byCategory = feesByEdition.get(tier.edition_id) ?? ({} as Record<"adult" | "young_adult" | "child", { min: number; max: number }>);
    const existing = byCategory[tier.category as "adult" | "young_adult" | "child"];
    byCategory[tier.category as "adult" | "young_adult" | "child"] = existing
      ? { min: Math.min(existing.min, tier.price_cents), max: Math.max(existing.max, tier.price_cents) }
      : { min: tier.price_cents, max: tier.price_cents };
    feesByEdition.set(tier.edition_id, byCategory);
  }

  const currencyFormatter = new Intl.NumberFormat(locale === "yo" ? "yo-NG" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
  const formatFee = (range: { min: number; max: number }) =>
    range.min === 0
      ? t("free")
      : range.min === range.max
        ? currencyFormatter.format(range.min / 100)
        : `${currencyFormatter.format(range.min / 100)}–${currencyFormatter.format(range.max / 100)}`;

  // Anchored at noon UTC (not `new Date(dateStr)` at midnight) so a
  // negative-offset timezone reading this at render time can't roll the
  // date back a day — same reasoning as ScheduleDay's weekday label.
  const dateFormatter = new Intl.DateTimeFormat(locale === "yo" ? "yo-NG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const formatDate = (dateStr: string) => dateFormatter.format(new Date(`${dateStr}T12:00:00Z`));

  return (
    <>
      <PageHero title={t("title")} tone="blue" photoSrc="/photos/gallery/IMG-20250719-WA0056.jpg" />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-4xl">
      <p className="text-sm text-[var(--color-muted)]">{recurringSpeakerNote}</p>
      {!editions || editions.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[var(--color-border)] p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-[var(--color-muted)]">{t("empty")}</p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {editions.map((edition) => (
            <li
              key={edition.id}
              className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
            >
              <h2 className="font-display text-xl text-[var(--color-fg)]">
                {edition.year} — {edition.theme}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)] tabular-nums">
                {formatDate(edition.starts_on)} – {formatDate(edition.ends_on)}
              </p>
              {feesByEdition.has(edition.id) && (
                <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                  <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
                    {t("feesHeading")}
                  </p>
                  <dl className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    {(["adult", "young_adult", "child"] as const).map((category) => {
                      const range = feesByEdition.get(edition.id)?.[category];
                      if (!range) return null;
                      return (
                        <div key={category} className="flex items-baseline gap-1.5">
                          <dt className="text-[var(--color-muted)]">
                            {t(category === "adult" ? "feeAdult" : category === "young_adult" ? "feeYoungAdult" : "feeChild")}:
                          </dt>
                          <dd className="font-semibold tabular-nums text-[var(--color-fg)]">{formatFee(range)}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
