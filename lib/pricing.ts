import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type PricingTier = Database["public"]["Tables"]["pricing_tiers"]["Row"];
export type RegistrantCategory = "adult" | "young_adult" | "child";

export async function getActivePricingForEdition(
  supabase: SupabaseClient<Database>,
  editionId: string,
  onDate: Date = new Date()
): Promise<PricingTier[]> {
  const iso = onDate.toISOString().slice(0, 10);

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
