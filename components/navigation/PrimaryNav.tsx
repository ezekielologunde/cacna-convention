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
      className="sticky top-0 z-40 flex items-center gap-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 px-6 py-3.5 backdrop-blur"
    >
      <Link
        href={`/${locale}`}
        className="flex items-center gap-2.5 font-display text-lg tracking-tight text-[var(--color-fg)]"
      >
        <span
          aria-hidden="true"
          className="h-7 w-7 flex-none rounded-full"
          style={{ background: "var(--flame)" }}
        />
        CACNA
      </Link>
      <ul className="hidden items-center gap-6 text-sm font-semibold tracking-wide text-[var(--color-muted)] uppercase md:flex">
        {PRIMARY_ITEMS.map((item) => (
          <li key={item.key}>
            <Link
              href={`/${locale}${item.href}`}
              className="transition-colors hover:text-[var(--color-maroon)]"
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
      <div className="ml-auto flex items-center gap-3">
        <Link
          href={`/${locale}/give`}
          className="hidden rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-maroon)] sm:inline-block"
        >
          {t("give")}
        </Link>
        <Link
          href={`/${locale}/register`}
          className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_26px_-10px_rgba(214,40,40,0.55)] transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--flame)" }}
        >
          {t("registerCta")}
        </Link>
      </div>
    </nav>
  );
}
