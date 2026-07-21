import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition, getMostRecentPastEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { PromoBanner } from "@/components/register/PromoBanner";
import { welcomeMessage } from "@/lib/content/welcome";
import { history } from "@/lib/content/history";
import { leadership } from "@/lib/content/leadership";
import { committee } from "@/lib/content/committee";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FindYourPath } from "@/components/home/FindYourPath";
import { ProgramGrid } from "@/components/home/ProgramGrid";
import { NextSteps } from "@/components/home/NextSteps";
import { ConventionTimeline } from "@/components/home/ConventionTimeline";
import { WatchSection } from "@/components/home/WatchSection";
import { PhotoMarquee } from "@/components/home/PhotoMarquee";
import { AnniversarySection } from "@/components/home/AnniversarySection";
import { Magnetic } from "@/components/ui/Magnetic";
import { Parallax } from "@/components/ui/Parallax";
import { CountUp } from "@/components/ui/CountUp";
import { mainGalleryPhotos } from "@/lib/content/gallery";

// The gallery teaser card's photo strip -- same first 3 photos the Gallery
// page itself opens with, so the preview is an honest sample.
const galleryPreviewPhotos = mainGalleryPhotos.slice(0, 3);

const RHYTHM_ICONS = {
  prayer: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  ministers: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  breakouts: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  revival: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const tPath = await getTranslations("FindYourPath");
  const tPrograms = await getTranslations("ProgramGrid");
  const tSteps = await getTranslations("NextSteps");
  const tNav = await getTranslations("Nav");

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

  // Real, already-published counts (same source About's Heritage stats use)
  // -- gives the hero more substance without inventing numbers.
  const stats = [
    { value: history.foundingYear, label: t("statFoundedLabel") },
    { value: leadership.length, label: t("statLeadersLabel") },
    { value: committee.length, label: t("statCommitteeLabel") },
  ];

  const rhythmItems = [
    { key: "prayer", title: t("rhythmPrayerTitle"), desc: t("rhythmPrayerDesc") },
    { key: "ministers", title: t("rhythmMinistersTitle"), desc: t("rhythmMinistersDesc") },
    { key: "breakouts", title: t("rhythmBreakoutsTitle"), desc: t("rhythmBreakoutsDesc") },
    { key: "revival", title: t("rhythmRevivalTitle"), desc: t("rhythmRevivalDesc") },
  ] as const;

  // Resolved ahead of JSX (rather than rendered as `<WatchSection />` /
  // `<PhotoMarquee />` directly) so this stays the single async boundary --
  // nesting a second/third async Server Component inside the returned tree
  // breaks tests/app/home.test.tsx's manual `await HomePage(...)` render
  // pattern (React's client tree can't resolve a nested async component on
  // its own; only the outermost `await` here handles that).
  const watchSection = await WatchSection({ locale });
  const photoMarquee = await PhotoMarquee();

  return (
    <div className="flex flex-1 flex-col">
      {edition && <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />}

      {/* Hero — asymmetric split: headline left, photo right (photo-above-headline on mobile) */}
      <section className="relative overflow-hidden px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
        <Parallax aria-hidden distance={30} className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: "var(--color-red)" }} />
        <Parallax aria-hidden distance={45} className="pointer-events-none absolute top-1/2 -right-32 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "var(--color-blue)" }} />
        <Reveal className="relative mx-auto max-w-6xl 2xl:max-w-7xl">
          <div className="flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              {!registrationOpen && (
                <Badge tone="blue" className="mb-3">
                  {t("registrationOpensBadge")}
                </Badge>
              )}
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase"
                style={{ background: "var(--color-red-light)", color: "var(--color-red-text)" }}
              >
                {t("kicker")}
              </span>
              {/* Hanken Grotesk (the body face) rather than the site's global
                  h1/h2/h3 font-family (Unbounded) -- at this size (96px at
                  lg) Unbounded's heavy geometric letterforms read as a
                  different visual language from the body copy immediately
                  below it. Section h2/h3s keep the display face; this is the
                  one heading big enough for the mismatch to actually
                  register. Set inline: globals.css's `h1, h2, h3 {
                  font-family: var(--font-heading) }` rule lives outside any
                  Tailwind @layer, so it outranks the `font-sans` utility
                  class regardless of specificity -- confirmed by checking
                  the rendered page, where `font-sans` had no visible effect. */}
              <h1
                className="mt-5 text-5xl leading-[1.05] font-extrabold tracking-tight text-[var(--color-fg)] sm:text-7xl lg:text-8xl"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {t("title")}
              </h1>
              <p className="mx-auto mt-5 max-w-[48ch] text-lg text-[var(--color-muted)] lg:mx-0">{t("subtitle")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Magnetic strength={0.3}>
                  <Button href={`/${locale}/about`} variant="primary">
                    {t("learnMore")}
                  </Button>
                </Magnetic>
                <Button href={`/${locale}/schedule`} variant="outline">
                  {t("viewSchedule")}
                </Button>
              </div>
              <div className="mt-8 flex justify-center lg:justify-start">
                <Badge tone="gold">{t("establishedBadge", { year: history.foundingYear })}</Badge>
              </div>
              <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-8 lg:mx-0">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <CountUp value={stat.value} className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl" />
                    <div className="mt-1 text-[10px] font-bold tracking-wide text-[var(--color-muted)] uppercase sm:text-xs">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex-1">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-lg 2xl:max-w-xl">
                <Parallax aria-hidden distance={20} className="pointer-events-none absolute -top-8 -right-8 h-56 w-56 rounded-full opacity-50 blur-3xl" style={{ background: "var(--color-red)" }} />
                <Parallax aria-hidden distance={20} className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: "var(--color-blue)" }} />
                <div className="relative h-full w-full rotate-2 overflow-hidden rounded-[2rem] shadow-2xl">
                  <Image
                    src="/photos/hero-convention.jpg"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 32rem, 90vw"
                    className="hero-kenburns object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <a
          href="#welcome-section"
          aria-label={t("scrollCta")}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        >
          <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-muted)] uppercase">
            {t("scrollCta")}
          </span>
          <span aria-hidden="true" className="h-8 w-px bg-[var(--color-border)]">
            <span className="scroll-indicator-line block h-full w-full origin-top bg-[var(--color-red-text)]" />
          </span>
        </a>
      </section>

      <AnniversarySection
        locale={locale}
        heading={t("anniversaryHeading")}
        cta={t("anniversaryCta")}
        opensInNewTabLabel={t("opensInNewTab")}
      />

      {/* Welcome — two-column on desktop: gradient panel + message card */}
      <section
        id="welcome-section"
        className="relative overflow-hidden px-6 py-16 sm:py-20"
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
        <div className="relative mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center 2xl:max-w-6xl">
          <Reveal>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("welcomeHeading")}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-3xl bg-white/10 p-8 text-left backdrop-blur-sm sm:p-10">
              {welcomeMessage.paragraphs.map((paragraph, index) => (
                <p key={index} className={index > 0 ? "mt-4 text-white" : "text-white"}>
                  {paragraph}
                </p>
              ))}
              <p className="mt-4 text-white">
                {welcomeMessage.closingLead}{" "}
                <Link href={`/${locale}/contact`} className="font-semibold text-[var(--color-mist)] underline">
                  {t("contactLinkText")}
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>

        {/* The week's rhythm, folded directly into the Welcome band instead
            of a separate section with its own redundant "about us" framing
            heading -- the existing rhythm sentence leads straight into the
            4-up grid instead of repeating it under a second heading. */}
        <div className="relative mx-auto mt-16 max-w-5xl 2xl:max-w-6xl">
          <Reveal delay={140}>
            <p className="mx-auto max-w-2xl text-center text-white">{t("missionBody")}</p>
          </Reveal>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rhythmItems.map((item, i) => (
              <Reveal key={item.key} delay={180 + i * 80}>
                <Card padding="lg" className="h-full text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white"
                    style={{ background: i % 2 === 0 ? "var(--gradient-cta)" : "var(--color-blue-deep)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {RHYTHM_ICONS[item.key]}
                    </svg>
                  </span>
                  <h3 className="mt-4 font-display text-lg text-[var(--color-fg)]">{item.title}</h3>
                  <p className="mt-2 text-base text-[var(--color-muted)]">{item.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FindYourPath
        locale={locale}
        heading={tPath("heading")}
        intro={tPath("intro")}
        personaLabels={{
          firstTime: tPath("firstTimeLabel"),
          returning: tPath("returningLabel"),
          groupLeader: tPath("groupLeaderLabel"),
          minister: tPath("ministerLabel"),
        }}
        personaBodies={{
          firstTime: tPath("firstTimeBody"),
          returning: tPath("returningBody"),
          groupLeader: tPath("groupLeaderBody"),
          minister: tPath("ministerBody"),
        }}
        linkLabels={{
          register: tPath("linkRegister"),
          planVisit: tPath("linkPlanVisit"),
          schedule: tPath("linkSchedule"),
          news: tPath("linkNews"),
          give: tPath("linkGive"),
          contact: tPath("linkContact"),
          about: tPath("linkAbout"),
        }}
      />

      <ProgramGrid
        locale={locale}
        sectionLabel={tPrograms("sectionLabel")}
        heading={tPrograms("heading")}
        intro={tPrograms("intro")}
        cta={tPrograms("cta")}
        cardCta={tPrograms("cardCta")}
        labels={{
          youth: tNav("youth"),
          children: tNav("children"),
          goodWomen: tNav("goodWomen"),
          ministersWives: tNav("ministersWives"),
          cacma: tNav("cacma"),
          christianEducation: tNav("christianEducation"),
          businessGroup: tNav("businessGroup"),
        }}
      />

      {/* Convention Timeline — Just Concluded + genuinely future-dated
          programs, combined into one section instead of two separate bands */}
      <ConventionTimeline
        heading={t("upcomingHeading")}
        cta={t("upcomingCta")}
        locale={locale}
        pastEdition={pastEdition}
        formatDate={formatDate}
        justConcludedKicker={t("justConcludedKicker")}
        justConcludedCta={t("justConcludedCta")}
        pastConventionsCta={t("pastConventionsCta")}
      />

      {watchSection}

      {/* News + Gallery — a proper 2-up feature pair */}
      <Reveal>
        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 2xl:max-w-5xl">
            <Card padding="lg" hoverable className="flex h-full flex-col text-center sm:text-left">
              <Badge tone="red" className="mx-auto sm:mx-0">
                {t("newsHeading")}
              </Badge>
              <p className="mt-4 flex-1 text-[var(--color-muted)]">{t("newsBody")}</p>
              <Link
                href={`/${locale}/news`}
                className="mt-5 inline-flex items-center gap-1 self-center font-semibold text-[var(--color-red-text)] underline sm:self-start"
              >
                {t("newsCta")}
              </Link>
            </Card>
            <Card padding="lg" hoverable className="flex h-full flex-col text-center sm:text-left">
              {/* A real photo strip makes the case for the Gallery link far
                  better than another line of text -- these are the same
                  first 3 photos the Gallery page itself opens with. */}
              <div className="-mt-2 -mx-2 mb-4 grid grid-cols-3 gap-1.5 overflow-hidden rounded-2xl">
                {galleryPreviewPhotos.map((src) => (
                  <div key={src} className="relative aspect-square">
                    <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
              <Badge tone="blue" className="mx-auto sm:mx-0">
                {t("galleryHeading")}
              </Badge>
              <p className="mt-4 flex-1 text-[var(--color-muted)]">{t("galleryBody")}</p>
              <Link
                href={`/${locale}/gallery`}
                className="mt-5 inline-flex items-center gap-1 self-center font-semibold text-[var(--color-blue-text)] underline sm:self-start"
              >
                {t("galleryCta")}
              </Link>
            </Card>
          </div>
        </section>
      </Reveal>

      {photoMarquee}

      <NextSteps
        locale={locale}
        labels={{
          register: tSteps("registerLabel"),
          planVisit: tSteps("planVisitLabel"),
          give: tSteps("giveLabel"),
          programs: tSteps("programsLabel"),
        }}
        descriptions={{
          register: tSteps("registerDesc"),
          planVisit: tSteps("planVisitDesc"),
          give: tSteps("giveDesc"),
          programs: tSteps("programsDesc"),
        }}
      />

      {/* Registration + Give — one closing band, two columns */}
      <section className="px-6 py-16" style={{ background: "var(--color-surface)" }}>
        <Reveal className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.3fr_1fr] 2xl:max-w-6xl">
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center shadow-[var(--shadow-card)] sm:p-10 lg:text-left">
            <h2 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl lg:text-5xl">{t("registrationHeading")}</h2>
            {!registrationOpen && (
              <p className="mx-auto mt-3 max-w-[48ch] text-[var(--color-muted)] lg:mx-0">
                {t("registrationComingSoon")}
              </p>
            )}
            <div className="mt-6 flex justify-center lg:justify-start">
              {/* Registration isn't open yet, so its own button shouldn't
                  outrank the one CTA a visitor can actually complete today
                  -- primary styling swaps to Give below until it opens. */}
              <Magnetic strength={0.3}>
                <Button href={`/${locale}/register`} variant={registrationOpen ? "primary" : "outline"}>
                  {t("registrationCta")}
                </Button>
              </Magnetic>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center shadow-[var(--shadow-card)] sm:p-10 lg:text-left">
            <h3 className="font-display text-xl text-[var(--color-fg)]">{t("giveHeading")}</h3>
            <p className="mt-2 text-[var(--color-muted)]">{t("giveBody")}</p>
            <div className="mt-6 flex justify-center lg:justify-start">
              <Button href={`/${locale}/give`} variant={registrationOpen ? "secondary" : "primary"}>
                {t("giveCta")}
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
