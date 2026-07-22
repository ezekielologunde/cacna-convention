import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BulletList } from "@/components/ui/BulletList";
import { Parallax } from "@/components/ui/Parallax";
import { CountUp } from "@/components/ui/CountUp";
import { externalResources } from "@/lib/content/external-resources";
import { welcomeMessage } from "@/lib/content/welcome";
import type { LeadershipMember } from "@/lib/content/leadership";
import type { CommitteeMember } from "@/lib/content/committee";
import type { AboutConvention } from "@/lib/content/about-convention";
import type { history as History } from "@/lib/content/history";
import { statementOfFaith } from "@/lib/content/statement-of-faith";

// Moved here from the old homepage (now the Register flow) verbatim --
// same 4 icons, same "the week's rhythm" grid, just relocated to where the
// convention's story actually lives now.
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

/**
 * A single continuous, sectioned page (rebuilt to match the depth and
 * momentum of cacnorthamerica.com's own /about — a mission/foundation band,
 * a bold "it's family" statement, a heritage/stats band, real leadership and
 * committee grids, then an explore-further band) instead of the previous
 * tab-switcher UI, which read thin next to it. Org-wide content that would
 * duplicate cacnorthamerica.com's own /about (full history, the 24-zone
 * superintendent directory) stays trimmed to a short blurb + link, per the
 * standing decision that this site owns Convention-specific content only.
 *
 * The Welcome section below (message, week's rhythm, founding/leaders/
 * committee stats) moved here from the old homepage once that became the
 * Register flow -- this is now where "the convention's story" actually
 * lives, restyled with the same motion (Reveal/Parallax/CountUp) it had
 * there rather than a flat re-paste.
 */
export async function AboutContent({
  locale,
  leadership,
  committee,
  aboutConvention,
  history,
}: {
  locale: string;
  leadership: LeadershipMember[];
  committee: CommitteeMember[];
  aboutConvention: AboutConvention;
  history: typeof History;
}) {
  const t = await getTranslations("About");

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

  return (
    <div className="flex flex-1 flex-col">
      {/* Welcome — the convention's own greeting (verbatim, real
          organizational text) restyled with motion, plus the founding/
          leaders/committee stat trio and the week's rhythm grid, both
          moved here from the old homepage hero. */}
      <section
        className="relative overflow-hidden px-6 py-16 sm:py-20"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Parallax
          aria-hidden
          distance={30}
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-red)" }}
        />
        <Parallax
          aria-hidden
          distance={20}
          className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="text-xs font-bold tracking-[0.25em] text-[var(--color-mist)] uppercase">
              {t("welcomeKicker")}
            </span>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("welcomeHeading")}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white/10 p-8 text-left backdrop-blur-sm sm:p-10">
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
          <Reveal delay={160}>
            <div className="mx-auto mt-10 grid max-w-sm grid-cols-3 gap-4 border-t border-white/20 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <CountUp value={stat.value} className="font-display text-2xl text-white sm:text-3xl" />
                  <div className="mt-1 text-[10px] font-bold tracking-wide text-white/70 uppercase sm:text-xs">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-16 max-w-[clamp(20rem,92vw,76rem)]">
          <Reveal delay={200}>
            <p className="mx-auto max-w-2xl text-center text-white">{t("missionRhythmLead")}</p>
          </Reveal>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rhythmItems.map((item, i) => (
              <Reveal key={item.key} delay={240 + i * 80}>
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

      {/* Foundation — mission + the two pillars, as three cards */}
      <section className="px-6 py-16 sm:py-20" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-[clamp(20rem,92vw,76rem)]">
          <Reveal className="text-center">
            <h2 className="mx-auto max-w-2xl font-display text-3xl text-[var(--color-fg)] sm:text-4xl lg:text-5xl">
              {t("missionHeading")}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mx-auto mt-6 max-w-2xl text-center text-[var(--color-muted)]">
              {aboutConvention.introSentence}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-[var(--color-fg)]">
              {aboutConvention.missionStatement}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Reveal delay={120}>
              <Card padding="lg" className="h-full">
                <h3 className="font-display text-lg text-[var(--color-fg)]">{t("biblicallyBasedHeading")}</h3>
                <BulletList items={aboutConvention.biblicallyBased} className="gap-2 text-[var(--color-muted)]" />
              </Card>
            </Reveal>
            <Reveal delay={180}>
              <Card padding="lg" className="h-full">
                <h3 className="font-display text-lg text-[var(--color-fg)]">{t("kingdomFocusedHeading")}</h3>
                <BulletList items={aboutConvention.kingdomFocused} className="gap-2 text-[var(--color-muted)]" />
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What We Believe — the full Statement of Faith, deepening the
          Biblically Based pillar above with the actual doctrinal text */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl lg:text-5xl">{t("statementOfFaithHeading")}</h2>
          </Reveal>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {statementOfFaith.map((item, i) => (
              <Reveal key={item.title} delay={Math.min(i, 8) * 30}>
                <h3 className="font-display text-lg text-[var(--color-fg)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Family — bold red statement band */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-24" style={{ background: "var(--gradient-hero)" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-red)" }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("familyHeading")}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-6 max-w-xl text-white">{t("familyBody")}</p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 flex justify-center">
              {/* Explicit `style` overrides Button's own primary-variant gradient (inline
                  styles always win over the `variantStyle` it applies) -- this button must
                  render white regardless of theme since it sits on a dark gradient hero,
                  same theme-invariant reasoning as the site's other white-on-gradient CTAs. */}
              <Button
                href={`/${locale}/schedule`}
                variant="primary"
                className="text-[var(--color-red-text)] shadow-none hover:bg-white/90"
                style={{ background: "#fff" }}
              >
                {t("familyCta")}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Heritage — blue stats band */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-24" style={{ background: "var(--gradient-hero-alt)" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-blue)" }}
        />
        <div className="relative mx-auto max-w-[clamp(20rem,90vw,64rem)] text-center">
          <Reveal>
            <span className="text-xs font-bold tracking-[0.25em] text-[var(--color-mist)] uppercase">
              {t("heritageKicker")}
            </span>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("heritageHeading", { year: history.foundingYear })}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white">{history.summary}</p>
          </Reveal>
          {/* The founded-year/leaders/committee stat trio already appears in the
              homepage hero — repeating the identical three numbers here, directly
              above the real leadership and committee rosters this same page
              renders below, was pure redundancy rather than new information. */}
          <Reveal delay={160}>
            <p className="mt-8 text-white">
              {t("readFullStory")}{" "}
              <a
                href="https://cacnorthamerica.vercel.app/about"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("readFullStoryCta")}${t("opensInNewTab")}`}
                className="font-semibold text-white underline"
              >
                {t("readFullStoryCta")}
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-[clamp(20rem,92vw,76rem)]">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl lg:text-5xl">{t("leadership")}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {leadership.map((member, i) => (
              <Reveal key={member.name} delay={i * 60}>
                <Card hoverable className="flex h-full items-center gap-4">
                  <Image
                    src={member.photo}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 flex-none rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-fg)]">{member.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{member.title}</p>
                    {member.bio ? (
                      <p className="mt-2 text-sm text-[var(--color-muted)]">{member.bio}</p>
                    ) : null}
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Committee */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-[clamp(20rem,92vw,76rem)]">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl lg:text-5xl">{t("committee")}</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {committee.map((member, i) => (
              <Reveal key={member.name} delay={Math.min(i, 8) * 40}>
                <Card padding="sm" className="h-full">
                  <p className="text-sm font-semibold text-[var(--color-fg)]">{member.name}</p>
                  {member.role ? <p className="mt-0.5 text-xs text-[var(--color-muted)]">{member.role}</p> : null}
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Superintendents — trimmed blurb + link out (Phase 15 decision, unchanged) */}
      <section className="px-6 py-14">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[var(--color-muted)]">{t("superintendentsBlurb")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a
              href="https://cacnorthamerica.vercel.app/zones"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("findYourZone")}${t("opensInNewTab")}`}
              className="font-semibold text-[var(--color-red-text)] underline"
            >
              {t("findYourZone")}
            </a>
            {/* CACNA's site has one combined Zones & DCCs directory, not a
                separate /dccs route (which never existed -- this link
                404'd before). Both labels now point to that one directory. */}
            <a
              href="https://cacnorthamerica.vercel.app/zones"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("findYourDcc")}${t("opensInNewTab")}`}
              className="font-semibold text-[var(--color-red-text)] underline"
            >
              {t("findYourDcc")}
            </a>
          </div>
        </Reveal>
      </section>

      {/* Explore further */}
      <section className="px-6 py-16 sm:py-20" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-[clamp(20rem,92vw,76rem)]">
          <Reveal className="text-center">
            <h2 className="mx-auto max-w-2xl font-display text-3xl text-[var(--color-fg)] sm:text-4xl lg:text-5xl">
              {t("exploreHeading")}
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal>
              <Link href={`/${locale}/schedule`} className="block h-full">
                <Card hoverable className="h-full">
                  <p className="font-display text-lg text-[var(--color-fg)]">{t("exploreScheduleTitle")}</p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{t("exploreScheduleDesc")}</p>
                </Card>
              </Link>
            </Reveal>
            <Reveal delay={40}>
              <Link href={`/${locale}/register`} className="block h-full">
                <Card hoverable className="h-full">
                  <p className="font-display text-lg text-[var(--color-fg)]">{t("exploreRegisterTitle")}</p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{t("exploreRegisterDesc")}</p>
                </Card>
              </Link>
            </Reveal>
            {externalResources.map((resource, i) => (
              <Reveal key={resource.url} delay={(i + 2) * 40}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${resource.label}${t("opensInNewTab")}`}
                  className="block h-full"
                >
                  <Card hoverable className="h-full">
                    <p className="font-display text-lg text-[var(--color-fg)]">{resource.label}</p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{resource.description}</p>
                  </Card>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
