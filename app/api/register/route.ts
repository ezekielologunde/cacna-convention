import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
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

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterRequestBody;
  const supabase = createServiceClient();

  const edition = await getActiveEdition(supabase);

  if (!edition) {
    return NextResponse.json({ error: "Registration is not open" }, { status: 409 });
  }

  const tiers = await getActivePricingForEdition(supabase, edition.id);

  // Re-price every registrant from the server-side tiers looked up above.
  // Any `price_cents` (or similar) the client sent in the request body is
  // read nowhere below and is discarded entirely — the amount charged and
  // the amount stored always come from `priceForCategory`.
  const pricedRegistrants: { full_name: string; category: RegistrantCategory; price_cents: number }[] = [];
  for (const registrant of body.registrants) {
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
    return NextResponse.json({ error: "Failed to create registrants" }, { status: 500 });
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: pricedRegistrants.map((r) => ({
      price_data: {
        currency: "usd",
        unit_amount: r.price_cents,
        product_data: { name: `CACNA Convention registration — ${r.full_name} (${r.category})` },
      },
      quantity: 1,
    })),
    customer_email: body.contactEmail,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/register/confirmation?registration=${registration.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/register`,
    metadata: { registration_id: registration.id },
  });

  await supabase
    .from("registrations")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", registration.id);

  return NextResponse.json({ checkoutUrl: session.url });
}
