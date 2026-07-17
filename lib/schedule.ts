import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ScheduleSession = Database["public"]["Tables"]["schedule_sessions"]["Row"];

export async function getScheduleForEdition(
  supabase: SupabaseClient<Database>,
  editionId: string
): Promise<ScheduleSession[]> {
  const { data, error } = await supabase
    .from("schedule_sessions")
    .select("*")
    .eq("edition_id", editionId)
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
