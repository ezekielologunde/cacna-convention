import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// NEXT_PUBLIC_* vars must be read via a literal `process.env.NEXT_PUBLIC_X`
// expression for Next.js's client bundler to statically inline them into
// the browser bundle -- lib/env.ts's requireEnv(name) takes a dynamic
// string, so a call like requireEnv("NEXT_PUBLIC_SUPABASE_URL") is invisible
// to that static analysis and silently resolves to undefined in the
// browser (it works fine server-side, where process.env is a real live
// object). Discovered live in production: both this file's createClient()
// (used by admin login) and createAttendeeClient() below were throwing
// "Missing required environment variable" on every browser-side call --
// this had been broken since admin login was first built, just never
// exercised end-to-end in an actual browser until now.
function requirePublicEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createClient() {
  return createBrowserClient<Database>(
    requirePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requirePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

// Distinct cookie name from the default/admin client above -- both live on
// the same origin, so without this an attendee login and an admin login in
// the same browser (e.g. a shared church-office computer) would silently
// overwrite each other's session under the default cookie name.
export function createAttendeeClient() {
  return createBrowserClient<Database>(
    requirePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requirePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { cookieOptions: { name: "sb-cacna-site-auth-token" } }
  );
}
