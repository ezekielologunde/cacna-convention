import { NextResponse } from "next/server";
import { createServiceClient, createAttendeeClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition, priceForCategory, type RegistrantCategory } from "@/lib/pricing";
import { getStripeClient } from "@/lib/stripe";

type RegisterRequestBody = {
  registrationType: "individual" | "group";
  churchName: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  registrants: { fullName: string; category: RegistrantCategory }[];
};

const VALID_CATEGORIES: RegistrantCategory[] = ["adult", "young_adult", "child"];
const VALID_REGISTRATION_TYPES: RegisterRequestBody["registrationType"][] = ["individual", "group"];

// Plain, explicit checks rather than a schema library — the set of rules is
// small and fixed, and matches this route's existing (unvalidated) style.
function validateRequestBody(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }

  const b = body as Partial<RegisterRequestBody>;

  if (typeof b.registrationType !== "string" || !VALID_REGISTRATION_TYPES.includes(b.registrationType)) {
    return "registrationType must be 'individual' or 'group'";
  }

  if (typeof b.contactName !== "string" || b.contactName.trim() === "") {
    return "contactName is required";
  }

  if (typeof b.contactEmail !== "string" || b.contactEmail.trim() === "") {
    return "contactEmail is required";
  }

  if (!Array.isArray(b.registrants) || b.registrants.length === 0) {
    return "registrants must be a non-empty array";
  }

  for (const registrant of b.registrants) {
    if (!registrant || typeof registrant !== "object") {
      return "Each registrant must be an object";
    }

    const r = registrant as Partial<{ fullName: string; category: RegistrantCategory }>;

    if (typeof r.fullName !== "string" || r.fullName.trim() === "") {
      return "Each registrant must have a non-empty fullName";
    }

    if (typeof r.category !== "string" || !VALID_CATEGORIES.includes(r.category as RegistrantCategory)) {
      return `Invalid registrant category: ${String(r.category)}`;
    }
  }

  return null;
}

// Best-effort rollback for partial failures: a later step failed after an
// earlier insert already succeeded, so remove what was already written
// rather than leaving an orphaned registrations/registrants row behind. A
// cleanup failure is logged but never masks the original error being
// returned to the caller.
async function cleanupPartialRegistration(
  supabase: ReturnType<typeof createServiceClient>,
  registrationId: string,
  options: { deleteRegistrants: boolean }
): Promise<void> {
  try {
    if (options.deleteRegistrants) {
      const { error } = await supabase.from("registrants").delete().eq("registration_id", registrationId);
      if (error) {
        console.error("Failed to clean up registrants after a partial registration failure", {
          registrationId,
          error,
        });
      }
    }

    const { error } = await supabase.from("registrations").delete().eq("id", registrationId);
    if (error) {
      console.error("Failed to clean up registration after a partial failure", { registrationId, error });
    }
  } catch (cleanupError) {
    console.error("Cleanup after a partial registration failure threw", { registrationId, cleanupError });
  }
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationError = validateRequestBody(rawBody);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const body = rawBody as RegisterRequestBody;
  const supabase = createServiceClient();

  // Best-effort: if the caller has a signed-in attendee session, link the
  // registration to it so it shows up on their /account page. Registration
  // itself stays anonymous-capable — this never blocks on auth.
  const attendeeSupabase = await createAttendeeClient();
  const {
    data: { user: attendee },
  } = await attendeeSupabase.auth.getUser();

  const edition = await getActiveEdition(supabase);

  if (!edition) {
    return NextResponse.json({ error: "Registration is not open" }, { status: 409 });
  }

  const tiers = await getActivePricingForEdition(supabase, edition.id);

  // Re-price every registrant from the server-side tiers looked up above.
  // Any `price_cents` (or similar) the client sent in the request body is
  // read nowhere below and is discarded entirely — the amount charged and
  // the amount stored always come from `priceForCategory`.
  //
  // Child (1–19) is always Free per the design spec's fixed business rule —
  // unlike Adult/Young Adult, it is not admin-configurable via
  // `pricing_tiers`, so it never goes through that lookup at all.
  const pricedRegistrants: { full_name: string; category: RegistrantCategory; price_cents: number }[] = [];
  for (const registrant of body.registrants) {
    if (registrant.category === "child") {
      pricedRegistrants.push({
        full_name: registrant.fullName,
        category: registrant.category,
        price_cents: 0,
      });
      continue;
    }

    const price = priceForCategory(tiers, registrant.category);
    if (price === null) {
      return NextResponse.json(
        { error: `No active price for category ${registrant.category}` },
        { status: 400 }
      );
    }
    pricedRegistrants.push({
      full_name: registrant.fullName,
      category: registrant.category,
      price_cents: price,
    });
  }

  const totalAmountCents = pricedRegistrants.reduce((sum, r) => sum + r.price_cents, 0);

  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .insert({
      edition_id: edition.id,
      registration_type: body.registrationType,
      church_name: body.churchName,
      contact_name: body.contactName,
      contact_email: body.contactEmail,
      contact_phone: body.contactPhone || null,
      total_amount_cents: totalAmountCents,
      attendee_id: attendee?.id ?? null,
    })
    .select()
    .single();

  if (registrationError || !registration) {
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 });
  }

  const { error: registrantsError } = await supabase
    .from("registrants")
    .insert(
      pricedRegistrants.map((r) => ({
        registration_id: registration.id,
        full_name: r.full_name,
        category: r.category,
        price_cents: r.price_cents,
      }))
    );

  if (registrantsError) {
    await cleanupPartialRegistration(supabase, registration.id, { deleteRegistrants: false });
    return NextResponse.json({ error: "Failed to create registrants" }, { status: 500 });
  }

  // If every registrant is free (e.g. a child-only registration), there is
  // nothing for Stripe to charge — and Stripe Checkout rejects sessions
  // below its minimum (a $0 total among them), so skip Stripe entirely and
  // mark the registration paid directly.
  if (totalAmountCents === 0) {
    await supabase.from("registrations").update({ status: "paid" }).eq("id", registration.id);
    return NextResponse.json({
      checkoutUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/register/confirmation?registration=${registration.id}`,
    });
  }

  const stripe = getStripeClient();
  // $0 line items (free child registrants mixed in with paid ones) aren't
  // sent to Stripe at all — only registrants with an actual price become
  // checkout line items.
  const payableRegistrants = pricedRegistrants.filter((r) => r.price_cents > 0);

  // Card/debit payments carry a 4% processing surcharge (documented on the
  // Register page's Payment Options cards) -- Zelle/check payers pay the
  // base fee, so this is added only to the Stripe checkout total, never to
  // `total_amount_cents`/`price_cents` stored on the registration/registrant
  // rows below, which always reflect the actual registration fee itself.
  const CARD_PROCESSING_FEE_RATE = 0.04;
  const cardProcessingFeeCents = Math.round(totalAmountCents * CARD_PROCESSING_FEE_RATE);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        ...payableRegistrants.map((r) => ({
          price_data: {
            currency: "usd",
            unit_amount: r.price_cents,
            product_data: { name: `CACNA Convention registration — ${r.full_name} (${r.category})` },
          },
          quantity: 1,
        })),
        ...(cardProcessingFeeCents > 0
          ? [
              {
                price_data: {
                  currency: "usd",
                  unit_amount: cardProcessingFeeCents,
                  product_data: { name: "Card Processing Fee (4%)" },
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      customer_email: body.contactEmail,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/register/confirmation?registration=${registration.id}`,
      // Registration lives at the homepage now, not /register (which just
      // redirects there) -- send cancellations straight back to skip the hop.
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      metadata: { registration_id: registration.id },
    });

    await supabase
      .from("registrations")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", registration.id);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch {
    await cleanupPartialRegistration(supabase, registration.id, { deleteRegistrants: true });
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
