import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type StoreProduct = Database["public"]["Tables"]["store_products"]["Row"];

export async function getActiveStoreProducts(
  supabase: SupabaseClient<Database>
): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from("store_products")
    .select("*")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function productsByCategory(products: StoreProduct[], category: StoreProduct["category"]) {
  return products.filter((p) => p.category === category);
}
