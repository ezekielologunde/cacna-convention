import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type PricingTier = Database["public"]["Tables"]["pricing_tiers"]["Row"];
export type RegistrantCategory = "adult" | "young_adult" | "child";

export async function getActivePricingForEdition(
  supabase: SupabaseClient<Database>,
  editionId: string,
  onDate: Date = new Date()
): Promise<PricingTier[]> {
  // Use America/New_York (the convention's timezone) rather than UTC so that
  // pricing-tier cutovers align with the convention's actual local calendar
  // date, regardless of the timezone the server process happens to run in.
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(onDate);

  const { data, error } = await supabase
    .from("pricing_tiers")
    .select("*")
    .eq("edition_id", editionId)
    .lte("starts_on", iso)
    .gte("ends_on", iso)
    .order("category", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function priceForCategory(
  tiers: Pick<PricingTier, "category" | "price_cents">[],
  category: RegistrantCategory
): number | null {
  const tier = tiers.find((t) => t.category === category);
  return tier ? tier.price_cents : null;
}

// The full fee ladder for an edition (every tier, any date), not just
// whichever one is active today -- used to show the whole early-bird
// schedule on the Register page rather than only the current price.
export async function getPricingLadderForEdition(
  supabase: SupabaseClient<Database>,
  editionId: string
): Promise<PricingTier[]> {
  const { data, error } = await supabase
    .from("pricing_tiers")
    .select("*")
    .eq("edition_id", editionId)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
