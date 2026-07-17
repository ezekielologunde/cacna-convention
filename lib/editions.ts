import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ActiveEdition = Pick<
  Database["public"]["Tables"]["convention_editions"]["Row"],
  "id" | "year"
>;

export async function getActiveEdition(
  supabase: SupabaseClient<Database>
): Promise<ActiveEdition | null> {
  const { data, error } = await supabase
    .from("convention_editions")
    .select("id, year")
    .in("status", ["current", "upcoming"])
    .order("year", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}
