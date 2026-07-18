"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { externalResources } from "@/lib/content/external-resources";

const ATTEND_ITEMS = [
  { key: "register", href: "/register" },
  { key: "about", href: "/about" },
  { key: "schedule", href: "/schedule" },
  { key: "planYourVisit", href: "/plan-your-visit" },
] as const;

const CONNECT_ITEMS = [
  { key: "give", href: "/give" },
  { key: "live", href: "/live" },
  { key: "news", href: "/news" },
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
          <div className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/brand/icon.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 flex-none rounded-lg object-cover"
            />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-[9px] font-bold tracking-[0.15em] text-[var(--color-gold-light)] uppercase">
                {t("orgKicker")}
              </span>
              <span className="mt-0.5 truncate font-display text-lg text-white">North America Convention</span>
            </span>
          </div>
          <p className="mt-3 max-w-[32ch] text-sm text-white/75">{tFooter("blurb")}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-wider text-white/55 uppercase">
            {tFooter("attendHeading")}
          </h4>
          <ul className="mt-3 flex flex-col text-sm">
            {ATTEND_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  className="flex min-h-11 items-center hover:text-[var(--color-gold-light)]"
                >
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
          <ul className="mt-3 flex flex-col text-sm">
            {CONNECT_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  className="flex min-h-11 items-center hover:text-[var(--color-gold-light)]"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            {externalResources.map((resource) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${resource.label}${tFooter("opensInNewTab")}`}
                  className="flex min-h-11 items-center hover:text-[var(--color-gold-light)]"
                >
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-wider text-white/55 uppercase">
            {tFooter("contactHeading")}
          </h4>
          <ul className="mt-3 flex flex-col text-sm">
            <li>
              <Link
                href={`/${locale}/contact`}
                className="flex min-h-11 items-center hover:text-[var(--color-gold-light)]"
              >
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
