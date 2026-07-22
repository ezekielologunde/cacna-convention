import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { PromoBanner } from "@/components/register/PromoBanner";
import { PageHero } from "@/components/ui/PageHero";
import { BulletList } from "@/components/ui/BulletList";
import { TravelTabs } from "@/components/plan-your-visit/TravelTabs";
import { VenueMap } from "@/components/plan-your-visit/VenueMap";
import { NearbyEssentials } from "@/components/plan-your-visit/NearbyEssentials";
import { PackingChecklist } from "@/components/plan-your-visit/PackingChecklist";
import { hotels, hotelGroupCode } from "@/lib/content/hotels";
import { rules } from "@/lib/content/rules";
import {
  recommendedAirport,
  nearbyAirports,
  drivingRoute,
  drivingRouteAlt,
  budgetLodgingNote,
  groundTransportNote,
  julyClimate,
  remotenessNote,
  packingChecklist,
  venueAddress,
} from "@/lib/content/travel";
import { nearbyEssentials } from "@/lib/content/nearby-essentials";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PlanYourVisit" });
  return pageMetadata({
    locale, path: "/plan-your-visit", title: t("title"),
    description: "Hotels, travel directions, weather, nearby essentials, and rules & etiquette for attending the CACNA Annual Convention at CAC Village.",
  });
}

export default async function PlanYourVisitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PlanYourVisit");

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

  const hotelsByCity = new Map<string, typeof hotels>();
  for (const hotel of hotels) {
    const existing = hotelsByCity.get(hotel.city) ?? [];
    existing.push(hotel);
    hotelsByCity.set(hotel.city, existing);
  }

  return (
    <div>
      <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />
      <PageHero title={t("title")} photoSrc="/photos/gallery/IMG-20250719-WA0047.jpg" />
      <div className="mx-auto w-full max-w-[clamp(20rem,90vw,60rem)] px-6 py-12">
        <section>
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("travelHeading")}</h2>
          <div className="mt-4">
            <TravelTabs
              flyingLabel={t("flyingTab")}
              drivingLabel={t("drivingTab")}
              venueHeading={t("venueHeading")}
              venueAddress={venueAddress}
              recommendedAirportLabel={t("recommendedAirport")}
              recommendedAirport={recommendedAirport}
              recommendedAirportMilesLabel={t("milesAway", { miles: recommendedAirport.distanceMiles })}
              otherAirportsHeading={t("otherAirportsHeading")}
              nearbyAirports={nearbyAirports}
              groundTransportNote={groundTransportNote}
              drivingHeading={t("drivingHeading")}
              drivingRoute={drivingRoute}
              drivingRouteAlt={drivingRouteAlt}
            />
          </div>
          <div className="mt-5">
            <VenueMap address={venueAddress} title={t("mapTitle")} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("hotelsHeading")}</h2>
          <p className="mt-2 max-w-[62ch] text-sm text-[var(--color-muted)]">{t("hotelsIntro")}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-red-text)]">
            {t("groupCode", { code: hotelGroupCode })}
          </p>

          <div className="mt-5 flex flex-col gap-6">
            {Array.from(hotelsByCity.entries()).map(([city, cityHotels]) => (
              <div key={city}>
                <h3 className="text-sm font-bold tracking-wide text-[var(--color-muted)] uppercase">
                  {city}
                </h3>
                <ul className="mt-2 flex flex-col gap-3">
                  {cityHotels.map((hotel) => (
                    <li
                      key={`${hotel.name}-${hotel.city}`}
                      className="flex flex-col justify-between gap-1 rounded-2xl border border-[var(--color-border)] p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold text-[var(--color-fg)]">{hotel.name}</p>
                        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                          {hotel.phone} · {hotel.bookingNote}
                        </p>
                      </div>
                      <p className="flex-none font-semibold text-[var(--color-fg)] tabular-nums">
                        ${hotel.ratePerNight}/night
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-fg)]">{t("budgetLodging")}: </span>
            {budgetLodgingNote}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("weatherHeading")}</h2>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]">
            <div>
              <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">{t("averageHighLabel")}</p>
              <p className="mt-1 font-display text-2xl text-[var(--color-fg)]">{julyClimate.averageHighF}°F</p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">{t("averageLowLabel")}</p>
              <p className="mt-1 font-display text-2xl text-[var(--color-fg)]">{julyClimate.averageLowF}°F</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--color-muted)]">{julyClimate.note}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{remotenessNote}</p>

          <h3 className="mt-6 text-sm font-bold tracking-wide text-[var(--color-red-text)] uppercase">
            {t("packingHeading")}
          </h3>
          <div className="mt-3">
            <PackingChecklist items={packingChecklist} resetCta={t("packingResetCta")} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("nearbyHeading")}</h2>
          <p className="mt-2 max-w-[62ch] text-sm text-[var(--color-muted)]">{t("nearbyIntro")}</p>
          <div className="mt-4">
            <NearbyEssentials
              items={nearbyEssentials}
              groupLabel={t("nearbyFilterGroupLabel")}
              filterLabels={{
                all: t("nearbyFilterAll"),
                food: t("nearbyFilterFood"),
                groceriesPharmacy: t("nearbyFilterGroceriesPharmacy"),
                gas: t("nearbyFilterGas"),
              }}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("rulesHeading")}</h2>

          <h3 className="mt-4 text-sm font-bold tracking-wide text-[var(--color-red-text)] uppercase">
            {t("rememberHeading")}
          </h3>
          <BulletList
            items={rules.remember}
            className="gap-2.5"
            itemClassName="text-sm text-[var(--color-fg)]"
          />

          <h3 className="mt-6 text-sm font-bold tracking-wide text-[var(--color-red-text)] uppercase">
            {t("rulesListHeading")}
          </h3>
          <BulletList
            items={rules.rules}
            className="gap-2.5"
            itemClassName="text-sm text-[var(--color-fg)]"
          />

          <p className="mt-6 text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-fg)]">{rules.attribution.name}</span>
            <br />
            {rules.attribution.title}
          </p>
        </section>
      </div>
    </div>
  );
}
