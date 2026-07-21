import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { AboutContent } from "@/components/about/AboutContent";
import { PromoBanner } from "@/components/register/PromoBanner";
import { PageHero } from "@/components/ui/PageHero";
import { leadership } from "@/lib/content/leadership";
import { committee } from "@/lib/content/committee";
import { aboutConvention } from "@/lib/content/about-convention";
import { history } from "@/lib/content/history";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return pageMetadata({ locale, path: "/about", title: t("title"), description: t("subtitle") });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

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
    <>
      <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} tone="blue" />
      <AboutContent
        locale={locale}
        leadership={leadership}
        committee={committee}
        aboutConvention={aboutConvention}
        history={history}
      />
    </>
  );
}
