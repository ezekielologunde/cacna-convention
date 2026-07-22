import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

type SupportRequestBody = {
  name?: string;
  email: string;
  subject: string;
  message: string;
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

  const body = rawBody as Partial<SupportRequestBody>;

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ status: "success" });
  }

  if (typeof body.email !== "string" || !EMAIL_PATTERN.test(body.email.trim())) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }
  if (typeof body.subject !== "string" || body.subject.trim() === "") {
    return NextResponse.json({ error: "A subject is required" }, { status: 400 });
  }
  if (typeof body.message !== "string" || body.message.trim() === "") {
    return NextResponse.json({ error: "A message is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  // attendee_id stays null here -- this route is for the site-wide chat
  // shortcut, reachable while signed out. A signed-in attendee's own
  // support tickets (tied to attendee_id, visible in their Account history)
  // still go through SupportTicketForm's direct client insert, unchanged.
  const { error } = await supabase.from("support_tickets").insert({
    attendee_id: null,
    name: body.name?.trim() || null,
    email: body.email.trim().toLowerCase(),
    subject: body.subject.trim(),
    message: body.message.trim(),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }

  return NextResponse.json({ status: "success" });
}
