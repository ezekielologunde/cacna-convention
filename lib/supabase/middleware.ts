import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";

/**
 * Refreshes a Supabase session cookie mid-request.
 *
 * `externalResponse`, when given, is written onto directly (never replaced)
 * so a response already produced by another middleware in the chain --
 * e.g. next-intl's locale redirect/rewrite -- survives intact. Getting this
 * wrong (constructing a fresh response instead of reusing the given one)
 * would silently discard whatever that other middleware just decided.
 *
 * `cookieName` selects which Supabase client's session this refreshes --
 * omit for the default/admin cookie, or pass the attendee cookie name (see
 * lib/supabase/client.ts's createAttendeeClient()) so the right session
 * gets refreshed for the right path.
 */
export async function updateSession(
  request: NextRequest,
  externalResponse?: NextResponse,
  cookieName?: string
) {
  const response = externalResponse ?? NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookieOptions: cookieName ? { name: cookieName } : undefined,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mutate the request's cookies too (not just the response's) so
          // Server Components rendered later in this same request see the
          // refreshed values via cookies() -- they can only read cookies,
          // not write them, so middleware is their only chance to see a
          // just-refreshed session within the same request/response cycle.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session if expired — required for Server Components,
  // which can only read cookies, not write them.
  await supabase.auth.getUser();

  return response;
}
