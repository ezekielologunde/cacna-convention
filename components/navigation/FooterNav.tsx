"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const FOOTER_ITEMS = [
  { key: "planYourVisit", href: "/plan-your-visit" },
  { key: "gallery", href: "/gallery" },
  { key: "archive", href: "/archive" },
  { key: "contact", href: "/contact" },
] as const;

export function FooterNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] px-6 py-8">
      <ul className="flex flex-wrap items-center gap-6">
        {FOOTER_ITEMS.map((item) => (
          <li key={item.key}>
            <Link href={`/${locale}${item.href}`}>{t(item.key)}</Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}
