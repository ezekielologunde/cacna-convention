import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CalendarDays, Compass, Mail, Phone, PlayCircle, ArrowUp } from "lucide-react";
import { FooterLink } from "@/components/navigation/FooterLink";
import { externalResources } from "@/lib/content/external-resources";
import { contacts } from "@/lib/content/contacts";

const ATTEND_ITEMS = [
  { key: "register", href: "/register" },
  { key: "about", href: "/about" },
  { key: "schedule", href: "/schedule" },
  { key: "children", href: "/children" },
  { key: "goodWomen", href: "/good-women" },
  { key: "ministersWives", href: "/ministers-wives" },
  { key: "cacma", href: "/cacma" },
  { key: "christianEducation", href: "/christian-education" },
  { key: "businessGroup", href: "/business-group" },
  { key: "youth", href: "/youth" },
  { key: "planYourVisit", href: "/plan-your-visit" },
] as const;

const CONNECT_ITEMS = [
  { key: "give", href: "/give" },
  { key: "store", href: "/store" },
  { key: "live", href: "/live" },
  { key: "news", href: "/news" },
  { key: "archive", href: "/archive" },
  { key: "gallery", href: "/gallery" },
] as const;

// Same channel lib/videos.ts pulls the /live feed from (CAC North America,
// Latunde Region) -- the one real "social" presence this site has, so it's
// the only icon link in the brand column rather than a row of unconfirmed
// platform guesses.
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/channel/UC9wwlYWGoII3B5vLtnIvJEw";

const generalInquiries = contacts.find((c) => c.roleKey === "generalInquiries")!;

// A Server Component -- only FooterLink (the active-page indicator) needs
// client JS. Everything else here (icons, translated copy, static links)
// used to ship as client JS purely because it lived in the same
// "use client" file as that one interactive piece.
export async function FooterNav({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const tFooter = await getTranslations("Footer");

  return (
    <footer aria-label="Footer" className="mt-auto text-white" style={{ background: "var(--gradient-band)" }}>
      <div aria-hidden="true" className="h-[3px] w-full" style={{ background: "var(--gradient-cta)" }} />

      <div className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <div className="flex min-w-0 items-center gap-2.5">
              <Image
                src="/brand/icon.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 flex-none rounded-lg object-cover"
              />
              <span className="flex min-w-0 flex-col leading-none">
                <span className="truncate text-[9px] font-bold tracking-[0.15em] text-[var(--color-mist)] uppercase">
                  {t("orgKicker")}
                </span>
                <span className="mt-1 truncate font-display text-xl text-white">Convention</span>
              </span>
            </div>
            <p className="mt-3 max-w-[32ch] text-sm text-white/75">{tFooter("blurb")}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/register`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold text-[#16121a]"
                style={{ background: "var(--color-gold)" }}
              >
                {t("registerCta")}
              </Link>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${tFooter("watchOnYoutube")}${tFooter("opensInNewTab")}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-white/40 hover:text-white"
              >
                <PlayCircle size={18} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white/55 uppercase">
              <CalendarDays size={14} strokeWidth={2.25} aria-hidden="true" />
              {tFooter("attendHeading")}
            </h4>
            <ul className="mt-3 flex flex-col text-sm">
              {ATTEND_ITEMS.map((item) => (
                <li key={item.key}>
                  <FooterLink href={`/${locale}${item.href}`}>{t(item.key)}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white/55 uppercase">
              <Compass size={14} strokeWidth={2.25} aria-hidden="true" />
              {tFooter("connectHeading")}
            </h4>
            <ul className="mt-3 flex flex-col text-sm">
              {CONNECT_ITEMS.map((item) => (
                <li key={item.key}>
                  <FooterLink href={`/${locale}${item.href}`}>{t(item.key)}</FooterLink>
                </li>
              ))}
              {externalResources.map((resource) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${resource.label}${tFooter("opensInNewTab")}`}
                    className="group flex min-h-11 items-center gap-2 text-white/75 transition-colors hover:text-white"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 flex-none rounded-full transition-colors group-hover:bg-[var(--color-gold)]"
                    />
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white/55 uppercase">
              <Mail size={14} strokeWidth={2.25} aria-hidden="true" />
              {tFooter("contactHeading")}
            </h4>
            <ul className="mt-3 flex flex-col text-sm">
              <li>
                <FooterLink href={`/${locale}/contact`}>{t("contact")}</FooterLink>
              </li>
              <li>
                <a
                  href={`tel:${generalInquiries.phone}`}
                  className="flex min-h-11 items-center gap-2 text-white/75 transition-colors hover:text-white"
                >
                  <Phone size={13} strokeWidth={2.25} aria-hidden="true" className="flex-none" />
                  {generalInquiries.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${generalInquiries.email}`}
                  className="flex min-h-11 items-center gap-2 break-all text-white/75 transition-colors hover:text-white"
                >
                  <Mail size={13} strokeWidth={2.25} aria-hidden="true" className="flex-none" />
                  {generalInquiries.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/70">
          <div>
            <p>{tFooter("tagline")}</p>
            <p className="mt-1">{tFooter("copyright", { year: new Date().getFullYear() })}</p>
          </div>
          <a
            href="#main-content"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/15 px-4 text-xs font-bold tracking-wide text-white/70 uppercase transition-colors hover:border-white/35 hover:text-white"
          >
            <ArrowUp size={13} strokeWidth={2.5} aria-hidden="true" />
            {tFooter("backToTop")}
          </a>
        </div>
      </div>
    </footer>
  );
}
