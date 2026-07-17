"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const PRIMARY_ITEMS = [
  { key: "home", href: "" },
  { key: "about", href: "/about" },
  { key: "schedule", href: "/schedule" },
  { key: "register", href: "/register" },
  { key: "live", href: "/live" },
] as const;

export function PrimaryNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-6 border-b border-[var(--color-border)] px-6 py-4"
    >
      <ul className="flex items-center gap-6">
        {PRIMARY_ITEMS.map((item) => (
          <li key={item.key}>
            <Link href={`/${locale}${item.href}`}>{t(item.key)}</Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/${locale}/register`}
        className="ml-auto rounded-full bg-[var(--color-brand)] px-5 py-2 font-medium text-[var(--color-brand-contrast)]"
      >
        {t("registerCta")}
      </Link>
      <Link
        href={`/${locale}/give`}
        className="rounded-full border border-[var(--color-border)] px-5 py-2 font-medium"
      >
        {t("give")}
      </Link>
    </nav>
  );
}
