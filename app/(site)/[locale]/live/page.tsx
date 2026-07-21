import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { RegisterCta } from "@/components/register/RegisterCta";
import { pageMetadata } from "@/lib/metadata";

// YouTube channel confirmed live and linked from cacnorthamerica.com's own
// "Video Channel" nav item (see docs/source-content/2026-cacnaconvention-org-content.md
// for provenance) -- the "latunderegi" handle matches the Latunde Region
// branding used elsewhere in this project's sourced content (e.g. the
// Superintendents flyer), confirming it's genuinely connected, not a
// coincidence.
const YOUTUBE_CHANNEL_URL = "https://youtube.com/@cacnorthamericalatunderegi1330";
// YouTube's own "current livestream, or channel page if nothing is live"
// URL -- confirmed 2026-07-17 by visiting it directly, which redirected to
// the real in-progress "CACNA 2026 CONVENTION - REVIVAL NIGHT (DAY 5)"
// broadcast. Works correctly whether or not anything is live right now, so
// it's safe as a permanent link rather than something that needs updating
// per convention.
const YOUTUBE_LIVE_URL = "https://www.youtube.com/@cacnorthamericalatunderegi1330/live";
// "ANNUAL PROGRAM" playlist -- the channel's own running collection of this
// year's convention sessions (confirmed 2026-07-17: 17 videos, "updated
// today", includes the live Day 5 broadcast alongside earlier days'
// recordings). Embedding the playlist instead of a single video ID keeps
// this page accurate as new sessions are added throughout convention week,
// and keeps showing real past sessions once the week is over.
const CURRENT_SESSIONS_PLAYLIST_ID = "PLhXt6OVepbyjadJt8WufxY-5Mt5OAjsSf";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Live" });
  return pageMetadata({ locale, path: "/live", title: t("title"), description: t("intro") });
}

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Live");

  return (
    <>
      <PageHero title={t("title")} subtitle={t("intro")} photoSrc="/photos/gallery/IMG-20250719-WA0044.jpg" />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-4xl">
      <a
        href={YOUTUBE_LIVE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t("watchLiveCta")}${t("opensInNewTab")}`}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        style={{ background: "var(--gradient-cta)" }}
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
        {t("watchLiveCta")}
      </a>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("sessionsHeading")}</h2>
        <p className="mt-2 max-w-[60ch] text-sm text-[var(--color-muted)]">{t("sessionsIntro")}</p>
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/videoseries?list=${CURRENT_SESSIONS_PLAYLIST_ID}`}
            title={t("sessionsHeading")}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <p className="mt-8 text-sm text-[var(--color-muted)]">
        {t("pastYearsNote")}{" "}
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("pastYearsCta")}${t("opensInNewTab")}`}
          className="font-semibold text-[var(--color-red-text)] underline"
        >
          {t("pastYearsCta")}
        </a>
      </p>
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
