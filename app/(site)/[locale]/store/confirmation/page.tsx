import { getTranslations, setRequestLocale } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/server";

const STATUS_KEYS = {
  pending: "statusPending",
  paid: "statusPaid",
  failed: "statusFailed",
  refunded: "statusRefunded",
} as const;

export default async function StoreConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("StoreConfirmation");

  const { order: orderId } = await searchParams;

  let order: { contact_name: string; status: string; total_amount_cents: number } | null = null;
  let items: { product_name: string; size: string | null; quantity: number; unit_price_cents: number }[] = [];
  // See register/confirmation/page.tsx for why this is distinguished from
  // "no order ID at all" -- a stale/bad link should never look identical
  // to a blank success page.
  let notFound = false;

  if (orderId) {
    const supabase = createServiceClient();
    const { data: ord } = await supabase
      .from("store_orders")
      .select("contact_name, status, total_amount_cents")
      .eq("id", orderId)
      .maybeSingle();

    if (ord) {
      order = ord;
      const { data: orderItems } = await supabase
        .from("store_order_items")
        .select("product_name, size, quantity, unit_price_cents")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      items = orderItems ?? [];
    } else {
      notFound = true;
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ background: "var(--color-red-deep)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v5M12 16h.01M12 3l9 16H3l9-16Z" />
          </svg>
        </span>
        <h1 className="mt-6 font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("notFoundTitle")}</h1>
        <p className="mt-4 max-w-[48ch] text-[var(--color-muted)]">{t("notFoundBody")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full text-white"
        style={{ background: "var(--gradient-cta)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-[48ch] text-[var(--color-muted)]">{t("body")}</p>

      {order ? (
        <div className="mt-8 w-full rounded-2xl border border-[var(--color-border)] p-6 text-left shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--color-muted)]">{order.contact_name}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-fg)]">
                  {item.product_name}
                  {item.size ? ` — ${item.size}` : ""} × {item.quantity}
                </span>
                <span className="text-[var(--color-muted)]">
                  ${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
            <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {t(STATUS_KEYS[order.status as keyof typeof STATUS_KEYS] ?? "statusPending")}
            </span>
            <span className="font-display text-xl text-[var(--color-fg)]">
              ${(order.total_amount_cents / 100).toFixed(2)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
