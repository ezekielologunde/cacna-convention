"use client";

import { useState } from "react";
import Image from "next/image";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur"
    >
      <div className="flex items-center gap-6 px-6 py-3.5">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 font-display text-lg tracking-tight text-[var(--color-fg)]"
        >
          <Image
            src="/brand/icon.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 flex-none rounded-full"
            priority
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
            className="hidden min-h-11 items-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-maroon)] sm:inline-flex"
          >
            {t("give")}
          </Link>
          <Link
            href={`/${locale}/register`}
            className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-white shadow-[0_10px_26px_-10px_rgba(214,40,40,0.55)] transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--flame)" }}
          >
            {t("registerCta")}
          </Link>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="primary-mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-[var(--color-fg)] md:hidden"
          >
            {mobileOpen ? (
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="primary-mobile-menu" className="border-t border-[var(--color-border)] px-6 py-2 md:hidden">
          <ul className="flex flex-col text-sm font-semibold tracking-wide text-[var(--color-fg)] uppercase">
            {PRIMARY_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-3"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/${locale}/give`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3"
              >
                {t("give")}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
