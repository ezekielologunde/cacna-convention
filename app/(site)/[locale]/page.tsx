import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AnniversarySection } from "@/components/home/AnniversarySection";
import { pageMetadata } from "@/lib/metadata";

// A deliberately simple, welcome-focused homepage -- the site owner
// reversed the earlier homepage↔Register merge (2026-07-22): Register is
// its own focused page again (app/(site)/[locale]/register/page.tsx), and
// this is a lighter front door instead. No live Supabase data here on
// purpose (no edition/pricing fetch) -- that detail already lives on
// /register, and a purely static page keeps this one genuinely simple.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  return pageMetadata({
    locale, path: "/", title: t("title"),
    description: t("subtitle"),
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const quickLinks = [
    { href: `/${locale}/register`, title: t("quickLinkRegisterTitle"), desc: t("quickLinkRegisterDesc") },
    { href: `/${locale}/schedule`, title: t("quickLinkScheduleTitle"), desc: t("quickLinkScheduleDesc") },
    { href: `/${locale}/store`, title: t("quickLinkStoreTitle"), desc: t("quickLinkStoreDesc") },
    { href: `/${locale}/give`, title: t("quickLinkGiveTitle"), desc: t("quickLinkGiveDesc") },
  ];

  return (
    <div>
      <section
        className="relative overflow-hidden px-6 py-20 sm:py-28"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-red)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.25em] text-[var(--color-mist)] uppercase">
            {t("heroKicker")}
          </span>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("heroHeading")}
          </h1>
          <p className="mx-auto mt-5 max-w-[52ch] text-white/90">{t("heroBody")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              href={`/${locale}/register`}
              variant="primary"
              style={{ background: "var(--gradient-cta-gold)", color: "#16121a" }}
            >
              {t("heroRegisterCta")}
            </Button>
            <Button
              href={`/${locale}/schedule`}
              variant="primary"
              className="shadow-none"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              {t("heroScheduleCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* 50th Anniversary -- kept prominent on the homepage, the site's
          actual front door, per the site owner's standing call that this
          "ad" placement shouldn't get folded away. */}
      <AnniversarySection
        locale={locale}
        badge={t("anniversaryBadge")}
        heading={t("anniversaryHeading")}
        cta={t("anniversaryCta")}
        opensInNewTabLabel={t("opensInNewTab")}
      />

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl">{t("missionHeading")}</h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-[var(--color-muted)]">{t("missionBody")}</p>
          <Link
            href={`/${locale}/about`}
            className="mt-5 inline-flex items-center font-semibold text-[var(--color-red-text)] hover:underline"
          >
            {t("missionCta")}
          </Link>
        </div>
      </section>

      <section className="px-6 pb-20" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-5xl pt-16">
          <h2 className="text-center font-display text-2xl text-[var(--color-fg)] sm:text-3xl">
            {t("quickLinksHeading")}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block h-full">
                <Card hoverable className="h-full">
                  <p className="font-display text-lg text-[var(--color-fg)]">{link.title}</p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{link.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
