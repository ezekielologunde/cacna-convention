import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";
import { requireEnv } from "@/lib/env";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature") ?? "";
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; payment_intent: string; metadata?: { registration_id?: string } };
    const registrationId = session.metadata?.registration_id;
    if (registrationId) {
      await supabase
        .from("registrations")
        .update({ status: "paid", stripe_payment_intent_id: session.payment_intent })
        .eq("id", registrationId);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as { id: string; metadata?: { registration_id?: string } };
    const registrationId = paymentIntent.metadata?.registration_id;
    if (registrationId) {
      await supabase.from("registrations").update({ status: "failed" }).eq("id", registrationId);
    }
  }

  return NextResponse.json({ received: true });
}
