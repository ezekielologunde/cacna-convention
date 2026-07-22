import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/metadata";

// A human-readable, definitive "every page on this site" catch-all --
// distinct from /sitemap.xml (machine-readable, for search engines). The
// primary nav's Explore/Programs dropdowns cover everything too, but this
// page is the one guaranteed place a visitor (or a future editor who forgot
// to add a new page to the nav) can find literally every route at a glance.
const GROUPS = [
  {
    key: "convention",
    pages: [
      { key: "register", href: "/register" },
      { key: "schedule", href: "/schedule" },
      { key: "planYourVisit", href: "/plan-your-visit" },
      { key: "store", href: "/store" },
      { key: "give", href: "/give" },
    ],
  },
  {
    key: "aboutNews",
    pages: [
      { key: "about", href: "/about" },
      { key: "news", href: "/news" },
      { key: "live", href: "/live" },
      { key: "archive", href: "/archive" },
      { key: "contact", href: "/contact" },
    ],
  },
  {
    key: "programs",
    pages: [
      { key: "youth", href: "/youth" },
      { key: "children", href: "/children" },
      { key: "goodWomen", href: "/good-women" },
      { key: "ministersWives", href: "/ministers-wives" },
      { key: "cacma", href: "/cacma" },
      { key: "christianEducation", href: "/christian-education" },
      { key: "businessGroup", href: "/business-group" },
    ],
  },
  {
    key: "account",
    pages: [{ key: "account", href: "/account" }],
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sitemap" });
  return pageMetadata({
    locale, path: "/sitemap", title: t("title"),
    description: "Every page on the CACNA Convention site, grouped and linked from one place.",
  });
}

export default async function SitemapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Sitemap");
  const tNav = await getTranslations("Nav");

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto w-full max-w-5xl px-6 py-12 2xl:max-w-7xl">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-flex items-center font-semibold text-[var(--color-red-text)] hover:underline"
        >
          {tNav("home")}
        </Link>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <div key={group.key}>
              <h2 className="text-xs font-bold tracking-[0.15em] text-[var(--color-muted)] uppercase">
                {t(`group_${group.key}`)}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {group.pages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={`/${locale}${page.href}`}
                      className="font-semibold text-[var(--color-fg)] hover:text-[var(--color-red-text)] hover:underline"
                    >
                      {tNav(page.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
