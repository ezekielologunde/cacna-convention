import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition, getMostRecentPastEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { PromoBanner } from "@/components/register/PromoBanner";
import { welcomeMessage } from "@/lib/content/welcome";
import { history } from "@/lib/content/history";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UpcomingPrograms } from "@/components/home/UpcomingPrograms";

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

  let nextDeadline: string | null = null;
  let priceBeforeIncrease: number | null = null;
  let tiersCount = 0;

  if (edition) {
    const tiers = await getActivePricingForEdition(supabase, edition.id);
    tiersCount = tiers.length;
    const adultTier = tiers.find((tier) => tier.category === "adult");
    if (adultTier) {
      nextDeadline = adultTier.ends_on;
      priceBeforeIncrease = adultTier.price_cents;
    }
  }
  // An edition row existing (status upcoming/current) doesn't mean
  // registration is actually open -- pricing_tiers is the real signal.
  // 2027 is the active edition today but has no pricing yet (it opens in
  // October 2026), so this must check both, not just `edition`.
  const registrationOpen = Boolean(edition) && tiersCount > 0;

  const pastEdition = await getMostRecentPastEdition(supabase);
  const dateFormatter = new Intl.DateTimeFormat(locale === "yo" ? "yo-NG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  // Anchored at noon UTC (not `new Date(dateStr)` at midnight) so a
  // negative-offset timezone reading this at render time can't roll the
  // date back a day -- same reasoning as Archive/ScheduleDay's date labels.
  const formatDate = (dateStr: string) => dateFormatter.format(new Date(`${dateStr}T12:00:00Z`));

  return (
    <div className="flex flex-1 flex-col">
      {edition && <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />}

      {/* Hero — asymmetric split: headline left, photo right (photo-above-headline on mobile) */}
      <section className="relative overflow-hidden px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-coral)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -right-32 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--color-teal)" }}
        />
        <Reveal className="relative mx-auto max-w-6xl">
          <div className="flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              {!registrationOpen && (
                <Badge tone="teal" className="mb-3">
                  {t("registrationOpensBadge")}
                </Badge>
              )}
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase"
                style={{ background: "var(--color-coral-light)", color: "var(--color-coral-text)" }}
              >
                {t("kicker")}
              </span>
              <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight text-[var(--color-fg)] sm:text-6xl lg:text-7xl">
                {t("title")}
              </h1>
              <p className="mx-auto mt-5 max-w-[48ch] text-lg text-[var(--color-muted)] lg:mx-0">{t("subtitle")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Button href={`/${locale}/about`} variant="primary">
                  {t("learnMore")}
                </Button>
                <Button href={`/${locale}/schedule`} variant="outline">
                  {t("viewSchedule")}
                </Button>
              </div>
              <div className="mt-8 flex justify-center lg:justify-start">
                <Badge tone="coral">{t("establishedBadge", { year: history.foundingYear })}</Badge>
              </div>
            </div>
            <div className="relative flex-1">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-md">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-8 -right-8 h-56 w-56 rounded-full opacity-50 blur-3xl"
                  style={{ background: "var(--color-coral)" }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full opacity-40 blur-3xl"
                  style={{ background: "var(--color-teal)" }}
                />
                <div className="relative h-full w-full rotate-2 overflow-hidden rounded-[2rem] shadow-2xl">
                  <Image
                    src="/photos/hero-convention.jpg"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 28rem, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Just Concluded — real data from the most recent past edition */}
      {pastEdition && (
        <Reveal>
          <section className="px-6 pb-16">
            <div className="mx-auto max-w-4xl">
              <Card
                padding="lg"
                className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left"
              >
                <div>
                  <Badge tone="teal">{t("justConcludedKicker")}</Badge>
                  <h2 className="mt-3 font-display text-xl text-[var(--color-fg)] sm:text-2xl">
                    {pastEdition.year} — {pastEdition.theme}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-muted)] tabular-nums">
                    {formatDate(pastEdition.starts_on)} – {formatDate(pastEdition.ends_on)} · {pastEdition.venue_name}
                  </p>
                </div>
                <div className="flex flex-none flex-wrap justify-center gap-3">
                  <Button href={`/${locale}/gallery`} variant="secondary">
                    {t("justConcludedCta")}
                  </Button>
                  <Button href={`/${locale}/archive`} variant="outline">
                    {t("pastConventionsCta")}
                  </Button>
                </div>
              </Card>
            </div>
          </section>
        </Reveal>
      )}

      {/* Welcome — two-column on desktop: gradient panel + message card */}
      <section className="relative overflow-hidden px-6 py-16 sm:py-20" style={{ background: "var(--gradient-hero-coral)" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-coral)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
          <Reveal>
            <span className="text-xs font-bold tracking-[0.25em] text-[var(--color-mist)] uppercase">
              {t("welcomeKicker")}
            </span>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">
              {t("welcomeHeading")}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-3xl bg-white/10 p-8 text-left backdrop-blur-sm sm:p-10">
              {welcomeMessage.paragraphs.map((paragraph, index) => (
                <p key={index} className={index > 0 ? "mt-4 text-white/85" : "text-white/85"}>
                  {paragraph}
                </p>
              ))}
              <p className="mt-4 text-white/85">
                {welcomeMessage.closingLead}{" "}
                <Link href={`/${locale}/contact`} className="font-semibold text-[var(--color-mist)] underline">
                  {t("contactLinkText")}
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Upcoming Programs — real, dated events */}
      <UpcomingPrograms heading={t("upcomingHeading")} cta={t("upcomingCta")} locale={locale} />

      {/* Mission + News + Gallery — consolidated 3-up card grid */}
      <Reveal>
        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            <Card padding="lg" className="flex flex-col text-center">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("missionHeading")}</h2>
              <p className="mt-3 flex-1 text-sm text-[var(--color-muted)]">{t("missionBody")}</p>
            </Card>
            <Card padding="lg" className="flex flex-col text-center">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("newsHeading")}</h2>
              <p className="mt-3 flex-1 text-sm text-[var(--color-muted)]">{t("newsBody")}</p>
              <Link href={`/${locale}/news`} className="mt-4 font-semibold text-[var(--color-coral-text)] underline">
                {t("newsCta")}
              </Link>
            </Card>
            <Card padding="lg" className="flex flex-col text-center">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("galleryHeading")}</h2>
              <Link href={`/${locale}/gallery`} className="mt-auto pt-4 font-semibold text-[var(--color-coral-text)] underline">
                {t("galleryCta")}
              </Link>
            </Card>
          </div>
        </section>
      </Reveal>

      {/* Registration */}
      <section className="px-6 py-16" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
          <h2 className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl">
            {t("registrationHeading")}
          </h2>
          {!registrationOpen && (
            <p className="mx-auto mt-3 max-w-[48ch] text-[var(--color-muted)]">
              {t("registrationComingSoon")}
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <Button href={`/${locale}/register`} variant="primary">
              {t("registrationCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* Give */}
      <section className="px-6 py-16">
        <div
          className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 rounded-3xl border border-[var(--color-border)] p-8 text-center shadow-[var(--shadow-card)] sm:flex-row sm:text-left"
        >
          <div>
            <h3 className="font-display text-xl text-[var(--color-fg)]">{t("giveHeading")}</h3>
            <p className="mt-2 max-w-[44ch] text-[var(--color-muted)]">{t("giveBody")}</p>
          </div>
          <Button href={`/${locale}/give`} variant="secondary" className="flex-none">
            {t("giveCta")}
          </Button>
        </div>
      </section>
    </div>
  );
}
