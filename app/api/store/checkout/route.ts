import { NextResponse } from "next/server";
import { createServiceClient, createAttendeeClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";
import { getActiveEdition } from "@/lib/editions";

type CheckoutRequestBody = {
  contactName: string;
  contactEmail: string;
  items: { productId: string; size: string | null; quantity: number }[];
};

function validateRequestBody(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }
  const b = body as Partial<CheckoutRequestBody>;

  if (typeof b.contactName !== "string" || b.contactName.trim() === "") {
    return "contactName is required";
  }
  if (typeof b.contactEmail !== "string" || b.contactEmail.trim() === "") {
    return "contactEmail is required";
  }
  if (!Array.isArray(b.items) || b.items.length === 0) {
    return "items must be a non-empty array";
  }
  for (const item of b.items) {
    if (!item || typeof item !== "object") {
      return "Each item must be an object";
    }
    const i = item as Partial<{ productId: string; quantity: number }>;
    if (typeof i.productId !== "string" || i.productId.trim() === "") {
      return "Each item must have a productId";
    }
    if (typeof i.quantity !== "number" || i.quantity < 1) {
      return "Each item must have a quantity of at least 1";
    }
  }
  return null;
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

  const body = rawBody as CheckoutRequestBody;
  const supabase = createServiceClient();

  const attendeeSupabase = await createAttendeeClient();
  const {
    data: { user: attendee },
  } = await attendeeSupabase.auth.getUser();

  const productIds = [...new Set(body.items.map((i) => i.productId))];
  const { data: products, error: productsError } = await supabase
    .from("store_products")
    .select("*")
    .eq("active", true)
    .in("id", productIds);

  if (productsError || !products) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }

  const productById = new Map(products.map((p) => [p.id, p]));

  // Re-price every line from the server-side catalog looked up above — the
  // client's cart never dictates the amount charged or stored, same
  // discipline as app/api/register/route.ts.
  const lines: { productId: string; name: string; size: string | null; quantity: number; unitPriceCents: number }[] = [];
  for (const item of body.items) {
    const product = productById.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Unknown or inactive product: ${item.productId}` }, { status: 400 });
    }
    if (product.sizes.length > 0 && (!item.size || !product.sizes.includes(item.size))) {
      return NextResponse.json({ error: `Invalid size for ${product.name}` }, { status: 400 });
    }
    lines.push({
      productId: product.id,
      name: product.name,
      size: product.sizes.length > 0 ? item.size : null,
      quantity: item.quantity,
      unitPriceCents: product.price_cents,
    });
  }

  const totalAmountCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);

  // Merchandise isn't tied to a specific edition the way a registration is,
  // but stamping whatever edition is active at purchase time lets the admin
  // per-year view (app/(admin)/admin/registrations/page.tsx) group orders
  // by convention year -- null when no edition is active/upcoming rather
  // than blocking checkout over it.
  const activeEdition = await getActiveEdition(supabase);

  const { data: order, error: orderError } = await supabase
    .from("store_orders")
    .insert({
      contact_name: body.contactName,
      contact_email: body.contactEmail,
      attendee_id: attendee?.id ?? null,
      edition_id: activeEdition?.id ?? null,
      total_amount_cents: totalAmountCents,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("store_order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      product_name: l.name,
      size: l.size,
      quantity: l.quantity,
      unit_price_cents: l.unitPriceCents,
    }))
  );

  if (itemsError) {
    await supabase.from("store_orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
  }

  const stripe = getStripeClient();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((l) => ({
        price_data: {
          currency: "usd",
          unit_amount: l.unitPriceCents,
          product_data: { name: l.size ? `${l.name} — ${l.size}` : l.name },
        },
        quantity: l.quantity,
      })),
      customer_email: body.contactEmail,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store/confirmation?order=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store`,
      metadata: { kind: "store_order", order_id: order.id },
    });

    await supabase.from("store_orders").update({ stripe_checkout_session_id: session.id }).eq("id", order.id);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch {
    await supabase.from("store_order_items").delete().eq("order_id", order.id);
    await supabase.from("store_orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
