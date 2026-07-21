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
    <div
      className="flex flex-wrap items-center justify-center gap-3 px-6 py-3 text-center text-sm font-semibold text-white sm:justify-between sm:text-left"
      style={{ background: "var(--gradient-cta)" }}
    >
      <p>{t("beforeIncrease", { price: (priceBeforeIncrease / 100).toFixed(0), date: nextDeadline })}</p>
      <Link
        href={`/${locale}`}
        className="inline-flex min-h-11 flex-none items-center rounded-full bg-white px-4 font-semibold text-[var(--color-red-text)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
