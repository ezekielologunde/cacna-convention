import { NextResponse } from "next/server";
import { createAttendeeClient, createServiceClient } from "@/lib/supabase/server";

// newsletter_subscribers has zero RLS policies (locked to the service role
// only, see supabase/migrations/0009_newsletter_subscribers.sql) -- every
// handler below authenticates the caller first via the attendee session's
// own cookies, then uses the service client for the actual read/write
// against the authenticated user's own email. A client can never supply an
// arbitrary email here the way the public /api/newsletter signup can.
async function requireAttendeeEmail() {
  const supabase = await createAttendeeClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export async function GET() {
  const email = await requireAttendeeEmail();
  if (!email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data } = await createServiceClient()
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  return NextResponse.json({ subscribed: Boolean(data) });
}

export async function POST() {
  const email = await requireAttendeeEmail();
  if (!email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { error } = await createServiceClient()
    .from("newsletter_subscribers")
    .insert({ email });

  // Postgres unique-violation -- already subscribed, not a failure.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ subscribed: true });
}

export async function DELETE() {
  const email = await requireAttendeeEmail();
  if (!email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { error } = await createServiceClient()
    .from("newsletter_subscribers")
    .delete()
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }

  return NextResponse.json({ subscribed: false });
}
