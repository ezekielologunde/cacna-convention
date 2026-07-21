import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BulletList } from "@/components/ui/BulletList";
import { externalResources } from "@/lib/content/external-resources";
import type { LeadershipMember } from "@/lib/content/leadership";
import type { CommitteeMember } from "@/lib/content/committee";
import type { AboutConvention } from "@/lib/content/about-convention";
import type { history as History } from "@/lib/content/history";
import { worldwideLeadership } from "@/lib/content/worldwide-leadership";

/**
 * A single continuous, sectioned page (rebuilt to match the depth and
 * momentum of cacnorthamerica.com's own /about — a mission/foundation band,
 * a bold "it's family" statement, a heritage/stats band, real leadership and
 * committee grids, then an explore-further band) instead of the previous
 * tab-switcher UI, which read thin next to it. Org-wide content that would
 * duplicate cacnorthamerica.com's own /about (full history, the 24-zone
 * superintendent directory) stays trimmed to a short blurb + link, per the
 * standing decision that this site owns Convention-specific content only.
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

  return (
    <div className="flex flex-1 flex-col">
      {/* Foundation — mission + the two pillars, as three cards */}
      <section className="px-6 py-16 sm:py-20" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-coral-text)] uppercase">
              {t("foundationKicker")}
            </span>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl text-[var(--color-fg)] sm:text-4xl">
              {t("missionHeading")}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-[var(--color-fg)]">
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

      {/* The Family — bold coral statement band */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-24" style={{ background: "var(--gradient-hero-coral)" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-coral)" }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="text-xs font-bold tracking-[0.25em] text-[var(--color-mist)] uppercase">
              {t("familyKicker")}
            </span>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">
              {t("familyHeading")}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-6 max-w-xl text-white/85">{t("familyBody")}</p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 flex justify-center">
              <Button href={`/${locale}/schedule`} variant="primary" className="bg-white text-[var(--color-coral-text)] shadow-none hover:bg-white/90" style={{ background: "#fff" }}>
                {t("familyCta")}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Heritage — teal stats band */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-24" style={{ background: "var(--gradient-hero-teal)" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-teal)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="text-xs font-bold tracking-[0.25em] text-[var(--color-mist)] uppercase">
              {t("heritageKicker")}
            </span>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] tracking-tight text-white sm:text-4xl">
              {t("heritageHeading", { year: history.foundingYear })}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">{history.summary}</p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                { value: String(history.foundingYear), label: t("statFoundedLabel") },
                { value: String(leadership.length), label: t("statLeadersLabel") },
                { value: String(committee.length), label: t("statCommitteeLabel") },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/10 px-6 py-6 backdrop-blur-sm">
                  <div className="font-display text-3xl text-white">{stat.value}</div>
                  <div className="mt-1 text-xs font-bold tracking-wide text-[var(--color-mist)] uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 text-white/80">
              {t("readFullStory")}{" "}
              <a
                href="https://cacnorthamerica.com/about"
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
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("leadership")}</h2>
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

      {/* Worldwide Leadership — CAC Nigeria & Overseas' executive leadership,
          evergreen organizational context (distinct from CACNA's own regional
          leadership above) */}
      <section className="px-6 py-16 sm:py-20" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("worldwideLeadershipHeading")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted)]">{t("worldwideLeadershipBlurb")}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {worldwideLeadership.map((leader, i) => (
              <Reveal key={leader.name} delay={i * 60}>
                <Card hoverable className="flex h-full items-center gap-4">
                  {leader.photo ? (
                    <Image
                      src={leader.photo}
                      alt=""
                      width={64}
                      height={64}
                      className="h-16 w-16 flex-none rounded-full object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-fg)]">{leader.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{leader.title}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Committee */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("committee")}</h2>
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
              href="https://cacnorthamerica.com/zones"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("findYourZone")}${t("opensInNewTab")}`}
              className="font-semibold text-[var(--color-coral-text)] underline"
            >
              {t("findYourZone")}
            </a>
            <a
              href="https://cacnorthamerica.com/dccs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("findYourDcc")}${t("opensInNewTab")}`}
              className="font-semibold text-[var(--color-coral-text)] underline"
            >
              {t("findYourDcc")}
            </a>
          </div>
        </Reveal>
      </section>

      {/* Explore further */}
      <section className="px-6 py-16 sm:py-20" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-teal-text)] uppercase">
              {t("exploreKicker")}
            </span>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl text-[var(--color-fg)] sm:text-4xl">
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
