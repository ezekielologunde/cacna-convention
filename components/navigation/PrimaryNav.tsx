"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/navigation/SearchBar";
import { AccountNavLink } from "@/components/navigation/AccountNavLink";

// "Register" is deliberately not a plain text item here -- it's already the
// pinned primary CTA button below, and having both meant the same
// destination appeared twice in the bar (confirmed while auditing the nav:
// a text link reading "Register" sitting right next to a button reading
// "Register Now").
const BEFORE_PROGRAMS_ITEMS = [
  { key: "home", href: "" },
  { key: "about", href: "/about" },
] as const;

const AFTER_PROGRAMS_ITEMS = [
  { key: "schedule", href: "/schedule" },
  { key: "news", href: "/news" },
  { key: "live", href: "/live" },
] as const;

// The convention's actual department/ministry pages -- previously reachable
// only via the footer (or a direct link), with no path to them from the
// primary nav or even the Schedule page's own day-by-day agenda.
const PROGRAM_ITEMS = [
  { key: "youth", href: "/youth" },
  { key: "children", href: "/children" },
  { key: "goodWomen", href: "/good-women" },
  { key: "ministersWives", href: "/ministers-wives" },
  { key: "cacma", href: "/cacma" },
  { key: "christianEducation", href: "/christian-education" },
  { key: "businessGroup", href: "/business-group" },
] as const;

export function PrimaryNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const programsTriggerRef = useRef<HTMLButtonElement>(null);
  const programsPanelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    const target = `/${locale}${href}`;
    return href === "" ? pathname === target : pathname.startsWith(target);
  };
  const isProgramActive = PROGRAM_ITEMS.some((item) => isActive(item.href));

  // Closes the dropdown on Escape (returning focus to its trigger, so
  // keyboard users don't lose their place) or on a click outside it --
  // same pattern already established for SearchBar's dialog.
  useEffect(() => {
    if (!programsOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProgramsOpen(false);
        programsTriggerRef.current?.focus();
      }
    }
    function onClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        programsPanelRef.current?.contains(target) ||
        programsTriggerRef.current?.contains(target)
      ) {
        return;
      }
      setProgramsOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [programsOpen]);

  // Closing the mobile menu should also collapse its nested Programs
  // section, so reopening the menu doesn't surprise with stale state.
  useEffect(() => {
    if (!mobileOpen) setMobileProgramsOpen(false);
  }, [mobileOpen]);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur"
    >
      <div className="flex items-center gap-6 px-6 pt-safe pb-3.5">
        <Link href={`/${locale}`} className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none">
          <Image
            src="/brand/icon.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 flex-none rounded-xl object-cover"
            priority
          />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-[10px] font-bold tracking-[0.15em] text-[var(--color-coral-text)] uppercase">
              {t("orgKicker")}
            </span>
            <span className="mt-1 truncate font-display text-xl tracking-tight text-[var(--color-fg)] sm:text-2xl">
              Convention
            </span>
          </span>
        </Link>
        <ul className="hidden items-center gap-6 text-sm font-semibold tracking-wide text-[var(--color-muted)] uppercase md:flex">
          {BEFORE_PROGRAMS_ITEMS.map((item) => (
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
          <li className="relative">
            <button
              ref={programsTriggerRef}
              type="button"
              aria-expanded={programsOpen}
              aria-controls="programs-menu"
              onClick={() => setProgramsOpen((open) => !open)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-coral-text)] ${
                isProgramActive || programsOpen ? "bg-[var(--color-surface)] text-[var(--color-coral-text)]" : ""
              }`}
            >
              {t("programs")}
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${programsOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {programsOpen ? (
              <div
                id="programs-menu"
                ref={programsPanelRef}
                className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2 normal-case shadow-[var(--shadow-card)]"
              >
                {PROGRAM_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={`/${locale}${item.href}`}
                    onClick={() => setProgramsOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold tracking-normal text-[var(--color-fg)] hover:bg-[var(--color-surface)] hover:text-[var(--color-coral-text)] ${
                      isActive(item.href) ? "text-[var(--color-coral-text)]" : ""
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
          {AFTER_PROGRAMS_ITEMS.map((item) => (
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
          {/*
            Visibility is controlled on a wrapper span, not via className on
            Button/ThemeToggle directly -- both components' own base classes
            already include an unconditional `inline-flex`, which sits at
            the same specificity as a caller-supplied `hidden` and can win
            the cascade regardless of class order (confirmed: Give rendered
            visible on mobile despite `hidden sm:inline-flex` before this
            fix). A wrapper's display is the only display-related class on
            that element, so there's no such conflict.
          */}
          <SearchBar />
          <span className="hidden sm:inline-flex">
            <AccountNavLink />
          </span>
          <span className="hidden sm:inline-flex">
            <Button href={`/${locale}/give`} variant="outline">
              {t("give")}
            </Button>
          </span>
          <Button href={`/${locale}/register`} variant="primary" aria-label={t("registerCta")}>
            <span aria-hidden="true" className="sm:hidden">{t("register")}</span>
            <span aria-hidden="true" className="hidden sm:inline">{t("registerCta")}</span>
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
            {BEFORE_PROGRAMS_ITEMS.map((item) => (
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
              <button
                type="button"
                aria-expanded={mobileProgramsOpen}
                aria-controls="mobile-programs-menu"
                onClick={() => setMobileProgramsOpen((open) => !open)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 ${
                  isProgramActive ? "text-[var(--color-coral-text)]" : ""
                }`}
              >
                {t("programs")}
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${mobileProgramsOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {mobileProgramsOpen ? (
                <ul id="mobile-programs-menu" className="flex flex-col pb-2 pl-3">
                  {PROGRAM_ITEMS.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={`/${locale}${item.href}`}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={`block rounded-lg px-3 py-2.5 text-xs ${
                          isActive(item.href) ? "text-[var(--color-coral-text)]" : ""
                        }`}
                      >
                        {t(item.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
            {AFTER_PROGRAMS_ITEMS.map((item) => (
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
            <li>
              <Link
                href={`/${locale}/account`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3"
              >
                {t("account")}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
