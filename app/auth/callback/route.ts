import { NextResponse, type NextRequest } from "next/server";
import { createAttendeeClient } from "@/lib/supabase/server";

// Locale-independent on purpose: needs exactly one entry in Supabase's
// redirect-URL allow-list regardless of how many locales this site ever
// has, and avoids any uncertainty about how next-intl's middleware would
// treat a dynamic-segment route handler receiving an auth code (see
// middleware.ts's explicit /auth bypass). The login page preserves locale
// continuity by passing `next=/${locale}/account` here.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/en/account";

  if (!code) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const supabase = await createAttendeeClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const { error: upsertError } = await supabase
    .from("attendee_profiles")
    .upsert({ id: data.user.id, email: data.user.email! }, { onConflict: "id" });

  // A profile-upsert failure shouldn't block the user from landing signed
  // in -- attendee_profiles is a display convenience here, not the source
  // of truth for "is this user authenticated" (the session
  // exchangeCodeForSession just established already is).
  if (upsertError) {
    console.error("attendee_profiles upsert failed:", upsertError);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
