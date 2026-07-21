import { createBrowserClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

// Distinct cookie name from the default/admin client above -- both live on
// the same origin, so without this an attendee login and an admin login in
// the same browser (e.g. a shared church-office computer) would silently
// overwrite each other's session under the default cookie name.
export function createAttendeeClient() {
  return createBrowserClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { cookieOptions: { name: "sb-cacna-site-auth-token" } }
  );
}
