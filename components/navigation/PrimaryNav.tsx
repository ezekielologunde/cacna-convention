"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const PRIMARY_ITEMS = [
  { key: "home", href: "" },
  { key: "about", href: "/about" },
  { key: "schedule", href: "/schedule" },
  { key: "register", href: "/register" },
  { key: "live", href: "/live" },
  { key: "news", href: "/news" },
] as const;

export function PrimaryNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    const target = `/${locale}${href}`;
    return href === "" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur"
    >
      <div className="flex items-center gap-6 px-6 py-3.5">
        <Link href={`/${locale}`} className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none">
          <Image
            src="/brand/icon.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 flex-none rounded-xl object-cover"
            priority
          />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-[10px] font-bold tracking-[0.15em] text-[var(--color-coral-text)] uppercase">
              {t("orgKicker")}
            </span>
            <span className="mt-0.5 truncate font-display text-base tracking-tight text-[var(--color-fg)] sm:text-lg">
              North America Convention
            </span>
          </span>
        </Link>
        <ul className="hidden items-center gap-6 text-sm font-semibold tracking-wide text-[var(--color-muted)] uppercase md:flex">
          {PRIMARY_ITEMS.map((item) => (
            <li key={item.key}>
              <Link
                href={`/${locale}${item.href}`}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-lg px-2.5 py-1.5 transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-coral-text)] ${
                  isActive(item.href) ? "bg-[var(--color-surface)] text-[var(--color-coral-text)]" : ""
                }`}
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Button href={`/${locale}/give`} variant="outline" className="hidden sm:inline-flex">
            {t("give")}
          </Button>
          <Button href={`/${locale}/register`} variant="primary">
            {t("registerCta")}
          </Button>
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
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 ${
                    isActive(item.href) ? "text-[var(--color-coral-text)]" : ""
                  }`}
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
            <li className="flex items-center justify-between px-3 py-3">
              <span>Theme</span>
              <ThemeToggle />
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
