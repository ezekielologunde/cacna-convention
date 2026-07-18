import { getTranslations, setRequestLocale } from "next-intl/server";

// YouTube channel confirmed live and linked from cacnorthamerica.com's own
// "Video Channel" nav item (see docs/source-content/2026-cacnaconvention-org-content.md
// for provenance) -- the "latunderegi" handle matches the Latunde Region
// branding used elsewhere in this project's sourced content (e.g. the
// Superintendents flyer), confirming it's genuinely connected, not a
// coincidence.
const YOUTUBE_CHANNEL_URL = "https://youtube.com/@cacnorthamericalatunderegi1330";

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Live");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <div className="mt-8 rounded-3xl border border-dashed border-[var(--color-border)] p-12">
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "var(--flame)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        </span>
        <p className="mx-auto mt-4 max-w-[42ch] text-[var(--color-muted)]">{t("comingSoon")}</p>
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--flame)" }}
        >
          {t("watchCta")}
        </a>
      </div>
    </div>
  );
}
