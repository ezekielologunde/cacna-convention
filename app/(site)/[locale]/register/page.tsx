import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition, getPricingLadderForEdition, priceForCategory } from "@/lib/pricing";
import { ConversionHero } from "@/components/ui/ConversionHero";
import { RegisterPageClient } from "@/components/register/RegisterPageClient";
import { PricingCards, type PricingCardCategory } from "@/components/register/PricingCards";
import { Card } from "@/components/ui/Card";
import { registrationGuidelines } from "@/lib/content/registration-guidelines";
import { paymentOptions } from "@/lib/content/payment-options";
import { pageMetadata } from "@/lib/metadata";

// Register is its own page again -- the site owner reversed the earlier
// homepage↔Register merge (2026-07-22), wanting the homepage to be a
// lighter, simpler welcome page (see app/(site)/[locale]/page.tsx) with
// Register as its own focused destination rather than the front door
// itself. No AnniversarySection here (unlike before) -- that "ad"
// placement now lives on the homepage, the actual front door; this page
// stays focused on the one job of converting a visitor into a registrant.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Register" });
  return pageMetadata({
    locale, path: "/register", title: t("title"),
    description: "Register for the CACNA Annual Convention — individual or church/group registration, with pricing by category.",
  });
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Register");

  const supabase = await createClient();
  const edition = await getActiveEdition(supabase);
  // An edition row existing (status upcoming/current) doesn't mean
  // registration is actually open -- pricing_tiers is the real signal
  // (empty for 2027 as of this writing; it opens in October 2026). Without
  // this check, the form renders and accepts submissions with no pricing
  // behind them the moment an edition row is created for the next year.
  const tiers = edition ? await getActivePricingForEdition(supabase, edition.id) : [];
  const registrationOpen = Boolean(edition) && tiers.length > 0;
  const ladder = edition ? await getPricingLadderForEdition(supabase, edition.id) : [];

  // Scoped to this page rather than widening the shared getActiveEdition()
  // (28+ call sites, most only ever needed id/year) -- theme/dates/venue
  // are only needed for the hero below.
  let theme: string | null = null;
  let dateRange = "";
  let venueName = "";
  let urgency: string | null = null;

  if (edition) {
    const { data: details } = await supabase
      .from("convention_editions")
      .select("theme, starts_on, ends_on, venue_name")
      .eq("id", edition.id)
      .maybeSingle();

    if (details) {
      theme = details.theme;
      venueName = details.venue_name;
      const intlLocale = locale === "yo" ? "yo-NG" : "en-US";
      const monthDayFormatter = new Intl.DateTimeFormat(intlLocale, { month: "long", day: "numeric", timeZone: "UTC" });
      const dayFormatter = new Intl.DateTimeFormat(intlLocale, { day: "numeric", timeZone: "UTC" });
      const monthFormatter = new Intl.DateTimeFormat(intlLocale, { month: "long", timeZone: "UTC" });
      const yearFormatter = new Intl.DateTimeFormat(intlLocale, { year: "numeric", timeZone: "UTC" });
      const start = new Date(`${details.starts_on}T12:00:00Z`);
      const end = new Date(`${details.ends_on}T12:00:00Z`);
      // "July 12–17, 2027" for the common same-month case, rather than
      // repeating the month name twice; falls back to the fully-qualified
      // form only when the range actually crosses a month boundary.
      dateRange = start.getUTCMonth() === end.getUTCMonth()
        ? `${monthFormatter.format(start)} ${dayFormatter.format(start)}–${dayFormatter.format(end)}, ${yearFormatter.format(end)}`
        : `${monthDayFormatter.format(start)}–${monthDayFormatter.format(end)}, ${yearFormatter.format(end)}`;
    }

    const adultTier = priceForCategory(tiers, "adult") !== null
      ? tiers.find((tier) => tier.category === "adult")
      : undefined;
    if (adultTier) {
      urgency = t("heroUrgency", { price: (adultTier.price_cents / 100).toFixed(0), date: adultTier.ends_on });
    }
  }

  const year = edition?.year ?? new Date().getFullYear();

  // Full fee-ladder cards -- every tier in `ladder`, not just today's
  // active one, so visitors can see the whole early-bird schedule at a
  // glance. The last tier per category (highest sort_order) is the
  // at-the-door rate, shown with a location label instead of a date.
  const activeTierIds = new Set(tiers.map((tier) => tier.id));
  const shortDateFormatter = new Intl.DateTimeFormat(locale === "yo" ? "yo-NG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const CATEGORY_ORDER: { category: "adult" | "young_adult" | "child"; labelKey: "pricingAdultLabel" | "pricingYoungAdultLabel" | "pricingChildLabel" }[] = [
    { category: "adult", labelKey: "pricingAdultLabel" },
    { category: "young_adult", labelKey: "pricingYoungAdultLabel" },
    { category: "child", labelKey: "pricingChildLabel" },
  ];
  const pricingCategories: PricingCardCategory[] = CATEGORY_ORDER.map(({ category, labelKey }) => {
    const rows = ladder.filter((tier) => tier.category === category);
    const maxSortOrder = rows.reduce((max, tier) => Math.max(max, tier.sort_order), 0);
    return {
      key: category,
      label: t(labelKey),
      tiers: rows.map((tier) => ({
        id: tier.id,
        priceLabel: tier.price_cents === 0 ? t("pricingFreeLabel") : `$${(tier.price_cents / 100).toFixed(0)}`,
        dateLabel:
          category === "child"
            ? ""
            : tier.sort_order === maxSortOrder
              ? t("pricingAtGroundLabel")
              : t("pricingThroughLabel", { date: shortDateFormatter.format(new Date(`${tier.ends_on}T12:00:00Z`)) }),
        isCurrent: activeTierIds.has(tier.id),
      })),
    };
  });

  return (
    <div>
      <ConversionHero
        photoSrc="/photos/gallery/IMG-20250719-WA0033.jpg"
        badge={venueName ? t("heroBadge", { dateRange, venue: venueName }) : undefined}
        heading={t("heroHeading", { year })}
        body={registrationOpen ? t("heroBodyOpen") : t("heroBodyComingSoon", { dateRange })}
        cta={
          registrationOpen
            ? { label: t("heroCtaOpen"), href: "#register-panel" }
            : { label: t("heroCtaComingSoon"), href: "#registration-guidelines" }
        }
      >
        {theme && (
          <p className="mx-auto mt-6 max-w-xl">
            <span className="block text-xs font-bold tracking-[0.15em] text-[var(--color-mist)] uppercase">
              {t("heroThemeLabel")}
            </span>
            <span className="mt-2 block font-display text-xl text-white sm:text-2xl">&ldquo;{theme}&rdquo;</span>
          </p>
        )}
        {urgency && (
          <p className="mx-auto mt-5 max-w-md rounded-2xl bg-white/12 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm">
            {urgency}
          </p>
        )}
      </ConversionHero>

      {ladder.length > 0 && (
        <section className="mx-auto max-w-[clamp(20rem,92vw,76rem)] px-6 pt-16">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("pricingHeading")}</h2>
          <div className="mt-4">
            <PricingCards categories={pricingCategories} currentRateLabel={t("pricingCurrentBadge")} />
          </div>
        </section>
      )}

      {registrationOpen && <RegisterPageClient />}

      <section id="registration-guidelines" className="mx-auto max-w-[clamp(20rem,90vw,60rem)] px-6 pt-16 pb-16">
        <h2 className="font-display text-lg text-[var(--color-fg)]">{t("guidelinesHeading")}</h2>
        <ol className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-muted)]">
          {registrationGuidelines.items.map((item, index) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="font-semibold text-[var(--color-red-text)] tabular-nums">
                {index + 1}.
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm font-semibold text-[var(--color-red-text)]">
          {registrationGuidelines.freeFoodNote}
        </p>
      </section>

      <section className="mx-auto max-w-[clamp(20rem,92vw,76rem)] px-6 pb-16">
        <h2 className="font-display text-lg text-[var(--color-fg)]">{t("paymentOptionsHeading")}</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {paymentOptions.methods.map((method) => (
            <Card key={method.name} padding="lg">
              <h3 className="font-display text-base text-[var(--color-fg)]">{method.name}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{method.detail}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
