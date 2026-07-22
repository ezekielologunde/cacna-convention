"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function PromoBanner({
  nextDeadline,
  priceBeforeIncrease,
}: {
  nextDeadline: string | null;
  priceBeforeIncrease: number | null;
}) {
  const t = useTranslations("PromoBanner");
  const locale = useLocale();

  // Both props land null the moment there's no active pricing tier for the
  // adult category -- the same "registration isn't open yet" signal
  // RegisterCta.tsx checks elsewhere on the site. This used to render
  // nothing in that case, silently leaving About/Schedule/Plan Your Visit
  // -- three of the most-visited pages on the site -- with no path back to
  // Register at all for the months between conventions when this is true.
  const registrationOpen = nextDeadline !== null && priceBeforeIncrease !== null;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3 px-6 py-3 text-center text-sm font-semibold text-white sm:justify-between sm:text-left"
      style={{ background: "var(--gradient-cta)" }}
    >
      <p>
        {registrationOpen
          ? t("beforeIncrease", { price: (priceBeforeIncrease / 100).toFixed(0), date: nextDeadline })
          : t("comingSoon")}
      </p>
      <Link
        href={`/${locale}/register`}
        className="inline-flex min-h-11 flex-none items-center rounded-full bg-white px-4 font-semibold text-[var(--color-red-text)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
      >
        {registrationOpen ? t("cta") : t("comingSoonCta")}
      </Link>
    </div>
  );
}
