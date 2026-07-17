import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { PromoBanner } from "@/components/register/PromoBanner";
import { welcomeMessage } from "@/lib/content/welcome";

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

  if (edition) {
    const tiers = await getActivePricingForEdition(supabase, edition.id);
    const adultTier = tiers.find((tier) => tier.category === "adult");
    if (adultTier) {
      nextDeadline = adultTier.ends_on;
      priceBeforeIncrease = adultTier.price_cents;
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {edition && <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />}

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 text-center text-white sm:py-28">
        <Image
          src="/photos/hero-convention.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(107,16,16,0.88), rgba(158,27,27,0.8) 45%, rgba(20,10,8,0.75))",
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-[var(--color-gold-light)] uppercase">
            {t("kicker")}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-[48ch] text-lg text-white/85">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/about`}
              className="rounded-full px-6 py-3 font-semibold text-[var(--color-maroon-deep)]"
              style={{ background: "var(--color-gold)" }}
            >
              {t("learnMore")}
            </Link>
            <Link
              href={`/${locale}/schedule`}
              className="rounded-full border border-white/45 px-6 py-3 font-semibold text-white transition-colors hover:border-white"
            >
              {t("viewSchedule")}
            </Link>
          </div>
        </div>
      </section>

      {/* Welcome */}
      <section className="px-6 py-16" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl">
            {t("welcomeHeading")}
          </h2>
          {welcomeMessage.paragraphs.map((paragraph, index) => (
            <p key={index} className="mt-4 text-[var(--color-muted)]">
              {paragraph}
            </p>
          ))}
          <p className="mt-4 text-[var(--color-muted)]">
            {welcomeMessage.closingLead}{" "}
            <Link
              href={`/${locale}/contact`}
              className="font-semibold text-[var(--color-maroon)] underline"
            >
              {t("contactLinkText")}
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Mission / what a CACNA week looks like */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl">
            {t("missionHeading")}
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">{t("missionBody")}</p>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="px-6 pb-16 text-center">
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("galleryHeading")}</h2>
        <Link
          href={`/${locale}/gallery`}
          className="mt-4 inline-block rounded-full border border-[var(--color-border)] px-6 py-3 font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-maroon)]"
        >
          {t("galleryCta")}
        </Link>
      </section>

      {/* Registration */}
      <section className="px-6 py-16" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center sm:p-10">
          <h2 className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl">
            {t("registrationHeading")}
          </h2>
          {!edition && (
            <p className="mx-auto mt-3 max-w-[48ch] text-[var(--color-muted)]">
              {t("registrationComingSoon")}
            </p>
          )}
          <Link
            href={`/${locale}/register`}
            className="mt-6 inline-block rounded-full px-6 py-3 font-semibold text-white shadow-[0_10px_26px_-10px_rgba(214,40,40,0.55)] transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--flame)" }}
          >
            {t("registrationCta")}
          </Link>
        </div>
      </section>

      {/* Give */}
      <section className="px-6 py-16">
        <div
          className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 rounded-3xl border border-[var(--color-border)] p-8 text-center sm:flex-row sm:text-left"
        >
          <div>
            <h3 className="font-display text-xl text-[var(--color-fg)]">{t("giveHeading")}</h3>
            <p className="mt-2 max-w-[44ch] text-[var(--color-muted)]">{t("giveBody")}</p>
          </div>
          <Link
            href={`/${locale}/give`}
            className="flex-none rounded-full px-6 py-3 font-semibold text-white"
            style={{ background: "var(--color-maroon)" }}
          >
            {t("giveCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
