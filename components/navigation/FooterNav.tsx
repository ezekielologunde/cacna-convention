"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const ATTEND_ITEMS = [
  { key: "register", href: "/register" },
  { key: "planYourVisit", href: "/plan-your-visit" },
  { key: "schedule", href: "/schedule" },
] as const;

const CONNECT_ITEMS = [
  { key: "give", href: "/give" },
  { key: "archive", href: "/archive" },
  { key: "gallery", href: "/gallery" },
] as const;

export function FooterNav() {
  const t = useTranslations("Nav");
  const tFooter = useTranslations("Footer");
  const locale = useLocale();

  return (
    <footer
      aria-label="Footer"
      className="mt-auto px-6 py-12 text-white"
      style={{ background: "var(--color-maroon-deep)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5 font-display text-lg">
            <span
              aria-hidden="true"
              className="h-6 w-6 flex-none rounded-full"
              style={{ background: "var(--flame)" }}
            />
            CACNA Convention
          </div>
          <p className="mt-3 max-w-[32ch] text-sm text-white/75">{tFooter("blurb")}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-wider text-white/55 uppercase">
            {tFooter("attendHeading")}
          </h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {ATTEND_ITEMS.map((item) => (
              <li key={item.key}>
                <Link href={`/${locale}${item.href}`} className="hover:text-[var(--color-gold-light)]">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-wider text-white/55 uppercase">
            {tFooter("connectHeading")}
          </h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {CONNECT_ITEMS.map((item) => (
              <li key={item.key}>
                <Link href={`/${locale}${item.href}`} className="hover:text-[var(--color-gold-light)]">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-wider text-white/55 uppercase">
            {tFooter("contactHeading")}
          </h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href={`/${locale}/contact`} className="hover:text-[var(--color-gold-light)]">
                {t("contact")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-white/15 pt-5 text-sm text-white/70">
        <p>{tFooter("tagline")}</p>
        <p className="mt-1">{tFooter("copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
