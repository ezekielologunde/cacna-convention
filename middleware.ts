import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Matches the attendee cookie name in lib/supabase/client.ts's
// createAttendeeClient() / lib/supabase/server.ts's createAttendeeClient().
const ATTENDEE_COOKIE_NAME = "sb-cacna-site-auth-token";
const ACCOUNT_PATH_PATTERN = /^\/(en|yo)\/account(\/|$)/;

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return updateSession(request);
  }

  if (pathname.startsWith("/auth")) {
    // app/auth/callback/route.ts owns its own cookie writes via
    // exchangeCodeForSession -- intlMiddleware would otherwise try to
    // locale-prefix this fixed path and break the redirect URL registered
    // with Supabase Auth.
    return NextResponse.next();
  }

  // Always run intl first, then layer attendee session refresh onto
  // *whatever it returns* (a redirect, a rewrite, or a pass-through) --
  // never construct a fresh response in its place. Getting this ordering
  // backwards silently breaks locale routing sitewide.
  const intlResponse = intlMiddleware(request);

  if (ACCOUNT_PATH_PATTERN.test(pathname)) {
    // Scoped to /account/* only -- refreshing on every anonymous
    // marketing-page request would add an auth network round-trip
    // site-wide for no benefit.
    return updateSession(request, intlResponse, ATTENDEE_COOKIE_NAME);
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
