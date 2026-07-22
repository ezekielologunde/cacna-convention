import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { Ticket, CalendarDays, ShoppingBag, HandHeart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { HeroSection } from "@/components/home/HeroSection";
import { AnniversarySection } from "@/components/home/AnniversarySection";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { pageMetadata } from "@/lib/metadata";

// A deliberately simple, welcome-focused homepage -- the site owner
// reversed the earlier homepage↔Register merge (2026-07-22): Register is
// its own focused page again (app/(site)/[locale]/register/page.tsx). One
// small Supabase read lives here despite that (registrationOpen, same
// signal RegisterCta.tsx already uses) -- registration for 2027 doesn't
// open until October 2026, and shipping this page with an unconditional
// "Register Now" the whole time between now and then would read as if
// registering actually works today.
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

  const supabase = await createClient();
  const edition = await getActiveEdition(supabase);
  const tiers = edition ? await getActivePricingForEdition(supabase, edition.id) : [];
  const registrationOpen = Boolean(edition) && tiers.length > 0;

  const quickLinks = [
    {
      href: `/${locale}/register`,
      title: t("quickLinkRegisterTitle"),
      desc: registrationOpen ? t("quickLinkRegisterDesc") : t("quickLinkRegisterDescComingSoon"),
      Icon: Ticket,
    },
    { href: `/${locale}/schedule`, title: t("quickLinkScheduleTitle"), desc: t("quickLinkScheduleDesc"), Icon: CalendarDays },
    { href: `/${locale}/store`, title: t("quickLinkStoreTitle"), desc: t("quickLinkStoreDesc"), Icon: ShoppingBag },
    { href: `/${locale}/give`, title: t("quickLinkGiveTitle"), desc: t("quickLinkGiveDesc"), Icon: HandHeart },
  ];

  return (
    <div>
      <HeroSection
        kicker={t("heroKicker")}
        heading={t("heroHeading")}
        body={t("heroBody")}
        registerHref={`/${locale}/register`}
        registerCta={t("heroRegisterCta")}
        scheduleHref={`/${locale}/schedule`}
        scheduleCta={t("heroScheduleCta")}
        comingSoonNote={registrationOpen ? undefined : t("heroComingSoonNote")}
      />

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
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl">{t("missionHeading")}</h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-[var(--color-muted)]">{t("missionBody")}</p>
          <Link
            href={`/${locale}/about`}
            className="mt-5 inline-flex items-center font-semibold text-[var(--color-red-text)] hover:underline"
          >
            {t("missionCta")}
          </Link>
        </Reveal>
      </section>

      <section className="px-6 pb-20" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-5xl pt-16">
          <Reveal>
            <h2 className="text-center font-display text-2xl text-[var(--color-fg)] sm:text-3xl">
              {t("quickLinksHeading")}
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link, i) => (
              <Reveal key={link.href} delay={i * 70}>
                <Link href={link.href} className="group block h-full">
                  <Card
                    hoverable
                    className="h-full !transition-[transform,box-shadow,border-color] !duration-300 [transition-timing-function:cubic-bezier(.22,1,.36,1)] hover:border-[var(--color-red-text)] hover:shadow-[var(--shadow-glow-red)] active:scale-[0.98]"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-red-light)] text-[var(--color-red-text)] transition-colors duration-300 group-hover:bg-[var(--color-red-text)] group-hover:text-white"
                    >
                      <link.Icon size={20} strokeWidth={2} />
                    </span>
                    <p className="mt-4 font-display text-lg text-[var(--color-fg)]">{link.title}</p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{link.desc}</p>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
