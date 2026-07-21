import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

type NewsletterRequestBody = {
  email: string;
  website?: string; // honeypot -- real visitors never see or fill this in
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = rawBody as Partial<NewsletterRequestBody>;

  // A filled honeypot field means a bot filled in every input it could
  // find. Respond exactly like a real success so it has no signal
  // anything was rejected, but never touch the database.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ status: "success" });
  }

  if (typeof body.email !== "string" || !EMAIL_PATTERN.test(body.email.trim())) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: body.email.trim().toLowerCase() });

  if (error) {
    // Postgres unique-violation -- this email is already subscribed, which
    // isn't a failure from the visitor's point of view.
    if (error.code === "23505") {
      return NextResponse.json({ status: "already_subscribed" });
    }
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ status: "success" });
}
