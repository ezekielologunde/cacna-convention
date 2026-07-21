import { createClient } from "@supabase/supabase-js";

/**
 * Read-only client for cacnorthamerica.com's separate Supabase project
 * (glulkaabkclogbwzugzp -- NOT this project's own database). Used only to
 * pull public, RLS-gated content (cac_world_news, blog_posts) for the News
 * page; never for anything requiring auth or writes.
 *
 * The URL and anon key below are public-safe by design (Supabase anon keys
 * are meant to ship in client bundles; access control is enforced entirely
 * by that project's RLS policies, not by keeping this key secret), so they
 * are hardcoded rather than routed through env vars -- this integration
 * isn't environment-specific the way this project's own Supabase project
 * is, and hardcoding avoids needing new Vercel env var configuration for a
 * value that isn't a secret in the first place.
 */
export function createCacnorthClient() {
  return createClient(
    "https://glulkaabkclogbwzugzp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWxrYWFia2Nsb2did3p1Z3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzE5NzQsImV4cCI6MjA5OTk0Nzk3NH0.mSEHgmvqOvILidRHBC3ARjhzxTJStTGCJ68CFDuWmpU"
  );
}
