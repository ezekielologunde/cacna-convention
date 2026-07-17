import { getTranslations, setRequestLocale } from "next-intl/server";
import { hotels, hotelGroupCode } from "@/lib/content/hotels";
import { rules } from "@/lib/content/rules";

export default async function PlanYourVisitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PlanYourVisit");

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>

      <section className="mt-8">
        <h2 className="text-xl font-medium">{t("hotelsHeading")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("groupCode", { code: hotelGroupCode })}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {hotels.map((hotel) => (
            <li key={`${hotel.name}-${hotel.city}`}>
              <p className="font-medium">{hotel.name}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {hotel.city} · {hotel.phone} · ${hotel.ratePerNight}/night · {hotel.bookingNote}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-medium">{t("rulesHeading")}</h2>
        <ul className="mt-4 list-disc pl-5">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
