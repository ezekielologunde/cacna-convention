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

  if (!nextDeadline || priceBeforeIncrease === null) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-[var(--color-brand)] px-6 py-3 text-[var(--color-brand-contrast)]">
      <p>{t("beforeIncrease", { price: (priceBeforeIncrease / 100).toFixed(0), date: nextDeadline })}</p>
      <Link
        href={`/${locale}/register`}
        className="whitespace-nowrap rounded-full bg-[var(--color-brand-contrast)] px-4 py-1 font-medium text-[var(--color-brand)]"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
