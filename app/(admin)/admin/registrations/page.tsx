import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { Badge } from "@/components/ui/Badge";

type Edition = { id: string; year: number; status: string };
type Registration = {
  id: string;
  church_name: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  registration_type: string;
  status: string;
  total_amount_cents: number;
  is_complimentary: boolean;
  created_at: string;
};
type Registrant = { id: string; registration_id: string; full_name: string; category: string; price_cents: number };
type StoreOrder = {
  id: string;
  contact_name: string;
  contact_email: string;
  status: string;
  total_amount_cents: number;
  created_at: string;
};
type StoreOrderItem = { id: string; order_id: string; product_name: string; size: string | null; quantity: number; unit_price_cents: number };

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_TONE: Record<string, "neutral" | "red" | "blue" | "gold"> = {
  paid: "blue",
  pending: "gold",
  failed: "red",
  refunded: "neutral",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status}</Badge>;
}

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ edition?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { edition: editionParam } = await searchParams;

  const { data: editionsData } = await supabase
    .from("convention_editions")
    .select("id, year, status")
    .order("year", { ascending: false });
  const editions: Edition[] = editionsData ?? [];

  // Default to whatever's current/upcoming (the earliest such year, same
  // definition lib/editions.ts's getActiveEdition uses) rather than simply
  // the newest row -- placeholder future years otherwise outrank the
  // edition people are actually registering for right now.
  const activeCandidate = editions
    .filter((e) => e.status === "current" || e.status === "upcoming")
    .sort((a, b) => a.year - b.year)[0];
  const selected =
    editions.find((e) => e.id === editionParam) ?? activeCandidate ?? editions[0] ?? null;

  let registrations: Registration[] = [];
  let registrantsByRegistration = new Map<string, Registrant[]>();
  let storeOrders: StoreOrder[] = [];
  let itemsByOrder = new Map<string, StoreOrderItem[]>();

  if (selected) {
    const { data: regs } = await supabase
      .from("registrations")
      .select("id, church_name, contact_name, contact_email, contact_phone, registration_type, status, total_amount_cents, is_complimentary, created_at")
      .eq("edition_id", selected.id)
      .order("created_at", { ascending: false });
    registrations = regs ?? [];

    if (registrations.length > 0) {
      const { data: registrants } = await supabase
        .from("registrants")
        .select("id, registration_id, full_name, category, price_cents")
        .in("registration_id", registrations.map((r) => r.id));
      for (const registrant of registrants ?? []) {
        const existing = registrantsByRegistration.get(registrant.registration_id) ?? [];
        existing.push(registrant);
        registrantsByRegistration.set(registrant.registration_id, existing);
      }
    }

    const { data: orders } = await supabase
      .from("store_orders")
      .select("id, contact_name, contact_email, status, total_amount_cents, created_at")
      .eq("edition_id", selected.id)
      .order("created_at", { ascending: false });
    storeOrders = orders ?? [];

    if (storeOrders.length > 0) {
      const { data: items } = await supabase
        .from("store_order_items")
        .select("id, order_id, product_name, size, quantity, unit_price_cents")
        .in("order_id", storeOrders.map((o) => o.id));
      for (const item of items ?? []) {
        const existing = itemsByOrder.get(item.order_id) ?? [];
        existing.push(item);
        itemsByOrder.set(item.order_id, existing);
      }
    }
  }

  const totalRegistrants = Array.from(registrantsByRegistration.values()).reduce((sum, list) => sum + list.length, 0);
  const registrationRevenueCents = registrations
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.total_amount_cents, 0);
  const storeRevenueCents = storeOrders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.total_amount_cents, 0);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link href="/admin" className="text-sm font-semibold text-[var(--color-red-text)] hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--color-fg)]">Registrants & purchases</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {editions.map((edition) => (
          <Link
            key={edition.id}
            href={`/admin/registrations?edition=${edition.id}`}
            className={
              selected?.id === edition.id
                ? "rounded-full bg-[var(--color-red-text)] px-4 py-2 text-sm font-bold text-white"
                : "rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:border-[var(--color-red-text)]"
            }
          >
            {edition.year}
          </Link>
        ))}
      </div>

      {!selected ? (
        <p className="mt-8 text-[var(--color-muted)]">No convention editions found.</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-border)] p-5">
              <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">Registrants</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--color-fg)]">{totalRegistrants}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] p-5">
              <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">Registration revenue (paid)</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--color-fg)]">{formatCents(registrationRevenueCents)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] p-5">
              <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">Store revenue (paid)</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--color-fg)]">{formatCents(storeRevenueCents)}</p>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--color-fg)]">Registrations ({registrations.length})</h2>
            {registrations.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-muted)]">No registrations for {selected.year} yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {registrations.map((reg) => (
                  <li key={reg.id} className="rounded-2xl border border-[var(--color-border)] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--color-fg)]">
                          {reg.church_name ?? reg.contact_name}
                          {reg.church_name && (
                            <span className="ml-2 font-normal text-[var(--color-muted)]">({reg.contact_name})</span>
                          )}
                        </p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {reg.contact_email}
                          {reg.contact_phone ? ` · ${reg.contact_phone}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {reg.is_complimentary && <Badge tone="gold">Complimentary</Badge>}
                        <StatusBadge status={reg.status} />
                        <span className="font-semibold text-[var(--color-fg)]">{formatCents(reg.total_amount_cents)}</span>
                      </div>
                    </div>
                    {(registrantsByRegistration.get(reg.id) ?? []).length > 0 && (
                      <ul className="mt-3 flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-3">
                        {(registrantsByRegistration.get(reg.id) ?? []).map((registrant) => (
                          <li key={registrant.id} className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-fg)]">
                              {registrant.full_name} <span className="text-[var(--color-muted)]">— {registrant.category}</span>
                            </span>
                            <span className="text-[var(--color-muted)]">{formatCents(registrant.price_cents)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--color-fg)]">Store purchases ({storeOrders.length})</h2>
            {storeOrders.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-muted)]">No store purchases for {selected.year} yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {storeOrders.map((order) => (
                  <li key={order.id} className="rounded-2xl border border-[var(--color-border)] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--color-fg)]">{order.contact_name}</p>
                        <p className="text-sm text-[var(--color-muted)]">{order.contact_email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="font-semibold text-[var(--color-fg)]">{formatCents(order.total_amount_cents)}</span>
                      </div>
                    </div>
                    <ul className="mt-3 flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-3">
                      {(itemsByOrder.get(order.id) ?? []).map((item) => (
                        <li key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-[var(--color-fg)]">
                            {item.product_name}
                            {item.size ? ` — ${item.size}` : ""} × {item.quantity}
                          </span>
                          <span className="text-[var(--color-muted)]">{formatCents(item.unit_price_cents * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
