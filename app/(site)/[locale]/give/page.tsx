import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Landmark, Send } from "lucide-react";
import { ConversionHero } from "@/components/ui/ConversionHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Give" });
  return pageMetadata({ locale, path: "/give", title: t("title"), description: t("intro") });
}

export default async function GivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Give");

  return (
    <>
      <ConversionHero
        photoSrc="/photos/gallery/IMG-20250719-WA0021.jpg"
        tone="blue"
        heading={t("title")}
        body={t("intro")}
        cta={{ label: t("chaseLabel") + " / " + t("zelleLabel"), href: "#village-payoff" }}
      />

      {/* CAC Village Pay Off — the one campaign genuinely about this site's
          own audience (the convention happens on this ground), so it gets
          real account details here rather than only a link-out. Other
          CACNA campaigns (Centenary, Hope For All) stay on cacnorthamerica.com
          per the standing CACNA/Convention content split. */}
      <section
        id="village-payoff"
        className="relative overflow-hidden px-6 py-16 sm:py-20"
        style={{ background: "var(--gradient-hero-alt)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-white/12 px-4 py-1.5 text-xs font-bold tracking-[0.15em] text-white uppercase backdrop-blur-sm">
            {t("villageEyebrow")}
          </span>
          <h2 className="mt-4 font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t("villageHeading")}
          </h2>
          <p className="mt-4 max-w-xl text-white/85">{t("villageBody")}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/18 bg-white/12 p-6 backdrop-blur-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/16 text-white">
                <Landmark size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-bold tracking-wide text-white/70 uppercase">{t("chaseLabel")}</p>
              <p className="mt-1 font-display text-xl text-white">{t("chaseValue")}</p>
            </div>
            <div className="rounded-2xl border border-white/18 bg-white/12 p-6 backdrop-blur-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/16 text-white">
                <Send size={18} strokeWidth={2} aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-bold tracking-wide text-white/70 uppercase">{t("zelleLabel")}</p>
              <p className="mt-1 font-display text-xl break-all text-white">{t("zelleValue")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* More ways to give */}
        <Card padding="lg">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("moreWaysHeading")}</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{t("moreWaysBody")}</p>
          <a
            href="https://cacnorthamerica.vercel.app/giving"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("moreWaysCta")}${t("opensInNewTab")}`}
            className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--color-blue-text)] underline"
          >
            {t("moreWaysCta")}
          </a>
        </Card>

        {/* Give, and come — the requested tie-in between giving toward the
            venue and actually registering to attend it. */}
        <div className="mt-6 rounded-2xl border border-[var(--color-border)] p-8 text-center shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl text-[var(--color-fg)] sm:text-2xl">{t("registerTieHeading")}</h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-[var(--color-muted)]">{t("registerTieBody")}</p>
          <div className="mt-6 flex justify-center">
            <Button href={`/${locale}/register`} variant="primary">
              {t("registerTieCta")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
