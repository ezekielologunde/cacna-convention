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
// "Register Now"). "Home" is also gone -- the homepage IS the Register
// flow now, and the logo already links there, so a plain "Home" text link
// would be a second, redundant path to the same place.
const BEFORE_PROGRAMS_ITEMS = [
  { key: "about", href: "/about" },
] as const;

const AFTER_PROGRAMS_ITEMS = [
  { key: "schedule", href: "/schedule" },
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

// Every other real page on the site that isn't already a top-level link, a
// Program, or one of the two priority CTA buttons (Register/Store) -- News
// and Live used to be flat top-level links, and Plan Your Visit/Archive/
// Contact had no path into them from this nav at all (only the footer).
// Grouping them here means the primary nav alone -- not just nav+footer
// combined -- reaches every page on the site.
const EXPLORE_ITEMS = [
  { key: "planYourVisit", href: "/plan-your-visit" },
  { key: "news", href: "/news" },
  { key: "live", href: "/live" },
  { key: "archive", href: "/archive" },
  { key: "contact", href: "/contact" },
] as const;

// This site is CACNA's Annual Convention — a sub-site of the main
// organization, not a standalone entity. The primary nav had no path back
// to CACNA's own site at all; this is that path. cacnorthamerica.com
// currently still serves an old WordPress build, not the new one, so this
// points at the new site's actual live deployment until that domain is
// repointed.
const CACNA_HOME_URL = "https://cacnorthamerica.vercel.app";

// Shared underline-indicator treatment for every top-level text link --
// replaces the old filled-pill hover/active background (which read as
// "app chrome") with a slimmer, more editorial mark: a 2px accent bar that
// grows in under the label instead of a colored box around it.
function linkClass(active: boolean) {
  return `group relative inline-flex items-center rounded-md px-1 py-1.5 transition-colors hover:text-[var(--color-red-text)] ${
    active ? "text-[var(--color-red-text)]" : ""
  }`;
}
const UNDERLINE_BASE =
  "pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-100";

export function PrimaryNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const programsTriggerRef = useRef<HTMLButtonElement>(null);
  const programsPanelRef = useRef<HTMLDivElement>(null);
  const exploreTriggerRef = useRef<HTMLButtonElement>(null);
  const explorePanelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    const target = `/${locale}${href}`;
    return href === "" ? pathname === target : pathname.startsWith(target);
  };
  const isProgramActive = PROGRAM_ITEMS.some((item) => isActive(item.href));
  const isExploreActive = EXPLORE_ITEMS.some((item) => isActive(item.href));

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

  // Same open/close behavior as the Programs dropdown above, duplicated
  // rather than shared -- two short, independent effects read more clearly
  // here than a parameterized abstraction over just this one call site.
  useEffect(() => {
    if (!exploreOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExploreOpen(false);
        exploreTriggerRef.current?.focus();
      }
    }
    function onClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        explorePanelRef.current?.contains(target) ||
        exploreTriggerRef.current?.contains(target)
      ) {
        return;
      }
      setExploreOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [exploreOpen]);

  // Closing the mobile menu should also collapse its nested Programs
  // section, so reopening the menu doesn't surprise with stale state.
  useEffect(() => {
    if (!mobileOpen) setMobileProgramsOpen(false);
  }, [mobileOpen]);

  return (
    <nav
      aria-label="Primary"
      // The flat border-b is now paired with a slim brand-gradient accent
      // bar (below) rather than replaced by it -- keeps the bar reading as
      // a raised layer (shadow-sm) while giving it a touch of the site's
      // own color instead of a generic gray hairline.
      className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 shadow-sm backdrop-blur"
    >
      <div className="mx-auto flex max-w-[clamp(20rem,94vw,84rem)] items-center gap-6 px-6 pt-safe pb-3.5">
        <Link href={`/${locale}`} className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
          <Image
            src="/brand/icon.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 flex-none rounded-full object-cover"
            priority
          />
          {/* The wordmark is hidden entirely below `sm:`, not just
              truncated smaller -- on a narrow phone viewport this text
              block is squeezed to near-zero width between the search icon,
              Register button, and hamburger regardless of font size
              (confirmed: even "Convention" alone, with the kicker line
              already dropped, still rendered as literal "C…"). Icon-only
              branding on the smallest screens is a deliberate
              simplification, not a fallback -- it structurally can't
              truncate since there's no text competing for that space. The
              full kicker + "Convention" lockup returns at `sm:` and up,
              where the bar actually has room for it. */}
          <span className="hidden min-w-0 flex-col leading-none sm:flex">
            <span className="truncate text-[10px] font-bold tracking-[0.15em] text-[var(--color-red-text)] uppercase">
              {t("orgKicker")}
            </span>
            <span className="mt-1 truncate font-display text-2xl tracking-tight text-[var(--color-fg)]">
              Convention
            </span>
          </span>
        </Link>
        <ul className="hidden items-center gap-7 text-sm font-semibold tracking-wide text-[var(--color-muted)] uppercase md:flex">
          {BEFORE_PROGRAMS_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  aria-current={active ? "page" : undefined}
                  className={linkClass(active)}
                >
                  {t(item.key)}
                  <span
                    aria-hidden="true"
                    className={`${UNDERLINE_BASE} bg-[var(--color-red-text)] ${active ? "scale-x-100" : ""}`}
                  />
                </Link>
              </li>
            );
          })}
          <li className="relative">
            <button
              ref={programsTriggerRef}
              type="button"
              aria-expanded={programsOpen}
              aria-controls="programs-menu"
              onClick={() => setProgramsOpen((open) => !open)}
              className={`${linkClass(isProgramActive)} gap-1 ${programsOpen ? "text-[var(--color-red-text)]" : ""}`}
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
              <span
                aria-hidden="true"
                className={`${UNDERLINE_BASE} bg-[var(--color-red-text)] ${isProgramActive || programsOpen ? "scale-x-100" : ""}`}
              />
            </button>
            {programsOpen ? (
              <div
                id="programs-menu"
                ref={programsPanelRef}
                className="absolute top-full left-0 mt-3 w-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2 normal-case shadow-[var(--shadow-card)]"
              >
                {PROGRAM_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={`/${locale}${item.href}`}
                    onClick={() => setProgramsOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold tracking-normal text-[var(--color-fg)] hover:bg-[var(--color-surface)] hover:text-[var(--color-red-text)] ${
                      isActive(item.href) ? "text-[var(--color-red-text)]" : ""
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
          {AFTER_PROGRAMS_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  aria-current={active ? "page" : undefined}
                  className={linkClass(active)}
                >
                  {t(item.key)}
                  <span
                    aria-hidden="true"
                    className={`${UNDERLINE_BASE} bg-[var(--color-red-text)] ${active ? "scale-x-100" : ""}`}
                  />
                </Link>
              </li>
            );
          })}
          <li className="relative">
            <button
              ref={exploreTriggerRef}
              type="button"
              aria-expanded={exploreOpen}
              aria-controls="explore-menu"
              onClick={() => setExploreOpen((open) => !open)}
              className={`${linkClass(isExploreActive)} gap-1 ${exploreOpen ? "text-[var(--color-red-text)]" : ""}`}
            >
              {t("explore")}
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
                className={`transition-transform ${exploreOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              <span
                aria-hidden="true"
                className={`${UNDERLINE_BASE} bg-[var(--color-red-text)] ${isExploreActive || exploreOpen ? "scale-x-100" : ""}`}
              />
            </button>
            {exploreOpen ? (
              <div
                id="explore-menu"
                ref={explorePanelRef}
                className="absolute top-full left-0 mt-3 w-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2 normal-case shadow-[var(--shadow-card)]"
              >
                {EXPLORE_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={`/${locale}${item.href}`}
                    onClick={() => setExploreOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold tracking-normal text-[var(--color-fg)] hover:bg-[var(--color-surface)] hover:text-[var(--color-red-text)] ${
                      isActive(item.href) ? "text-[var(--color-red-text)]" : ""
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <a
                  href={CACNA_HOME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExploreOpen(false)}
                  className="mt-1 block rounded-lg border-t border-[var(--color-border)] px-3 py-2.5 pt-3.5 text-sm font-semibold tracking-normal text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-red-text)]"
                >
                  {t("cacnaHome")} ↗
                </a>
              </div>
            ) : null}
          </li>
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
          <div className="hidden items-center gap-1 border-r border-[var(--color-border)] pr-3 sm:flex">
            <SearchBar />
            <AccountNavLink />
          </div>
          <span className="sm:hidden">
            <SearchBar />
          </span>
          {/* Give is a plain text link, not a button -- Register and Store
              are this site's two most important destinations (the owner's
              explicit call), so Give stays reachable but visually quieter
              rather than competing for the same weight. */}
          <Link
            href={`/${locale}/give`}
            className="hidden text-sm font-semibold text-[var(--color-muted)] transition-colors hover:text-[var(--color-red-text)] sm:inline-flex"
          >
            {t("give")}
          </Link>
          <span className="hidden sm:inline-flex">
            <Button href={`/${locale}/store`} variant="outline">
              {t("store")}
            </Button>
          </span>
          <Button
            href={`/${locale}/register`}
            variant="primary"
            aria-label={t("registerCta")}
            style={{ background: "var(--gradient-cta-gold)", color: "#16121a" }}
          >
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

      {/* A slim brand-gradient accent bar under the whole nav -- a small
          touch of the site's own color instead of a generic gray hairline,
          without going as far as recoloring the entire bar. */}
      <div aria-hidden="true" className="h-[3px] w-full" style={{ background: "var(--gradient-cta)" }} />

      {mobileOpen ? (
        <div id="primary-mobile-menu" className="border-t border-[var(--color-border)] px-6 py-4 md:hidden">
          <p className="px-3 text-[11px] font-bold tracking-[0.15em] text-[var(--color-muted)] uppercase">
            {t("mobileExploreHeading")}
          </p>
          <ul className="mt-1 flex flex-col text-base font-semibold text-[var(--color-fg)]">
            {BEFORE_PROGRAMS_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3.5 ${
                    isActive(item.href) ? "text-[var(--color-red-text)]" : ""
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
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3.5 ${
                  isProgramActive ? "text-[var(--color-red-text)]" : ""
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
                <ul className="flex flex-col pb-2 pl-3" id="mobile-programs-menu">
                  {PROGRAM_ITEMS.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={`/${locale}${item.href}`}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-normal text-[var(--color-muted)] ${
                          isActive(item.href) ? "text-[var(--color-red-text)]" : ""
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
                  className={`block rounded-lg px-3 py-3.5 ${
                    isActive(item.href) ? "text-[var(--color-red-text)]" : ""
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            {EXPLORE_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3.5 ${
                    isActive(item.href) ? "text-[var(--color-red-text)]" : ""
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={CACNA_HOME_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3.5"
              >
                {t("cacnaHome")} ↗
              </a>
            </li>
          </ul>

          <p className="mt-4 border-t border-[var(--color-border)] px-3 pt-4 text-[11px] font-bold tracking-[0.15em] text-[var(--color-muted)] uppercase">
            {t("mobileAccountHeading")}
          </p>
          <ul className="mt-1 flex flex-col text-base font-semibold text-[var(--color-fg)]">
            <li>
              <Link
                href={`/${locale}/store`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3.5"
              >
                {t("store")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/give`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3.5"
              >
                {t("give")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/account`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3.5"
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
