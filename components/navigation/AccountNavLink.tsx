"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function AccountNavLink() {
  const t = useTranslations("Nav");
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/account`}
      aria-label={t("account")}
      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface)]"
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" />
      </svg>
    </Link>
  );
}
