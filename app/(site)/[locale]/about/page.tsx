import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { AboutTabs } from "@/components/about/AboutTabs";
import { PromoBanner } from "@/components/register/PromoBanner";
import { leadership } from "@/lib/content/leadership";
import { committee } from "@/lib/content/committee";
import { history } from "@/lib/content/history";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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
      <AboutTabs leadership={leadership} committee={committee} history={history} />
    </>
  );
}
