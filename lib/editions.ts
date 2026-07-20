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

export type PastEdition = Pick<
  Database["public"]["Tables"]["convention_editions"]["Row"],
  "id" | "year" | "theme" | "venue_name" | "starts_on" | "ends_on"
>;

export async function getMostRecentPastEdition(
  supabase: SupabaseClient<Database>
): Promise<PastEdition | null> {
  const { data, error } = await supabase
    .from("convention_editions")
    .select("id, year, theme, venue_name, starts_on, ends_on")
    .eq("status", "past")
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}
