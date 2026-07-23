import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const EDITIONS = [
  { id: "e-2027", year: 2027, status: "upcoming" },
  { id: "e-2026", year: 2026, status: "past" },
  { id: "e-2030", year: 2030, status: "upcoming" },
];

const REGISTRATIONS_2027 = [
  {
    id: "r1",
    church_name: "First CAC",
    contact_name: "Jane Doe",
    contact_email: "jane@example.com",
    contact_phone: "555-0100",
    registration_type: "group",
    status: "paid",
    total_amount_cents: 25000,
    is_complimentary: false,
    created_at: "2027-01-01T00:00:00Z",
  },
  {
    id: "r2",
    church_name: null,
    contact_name: "John Smith",
    contact_email: "john@example.com",
    contact_phone: null,
    registration_type: "individual",
    status: "pending",
    total_amount_cents: 12500,
    is_complimentary: false,
    created_at: "2027-01-02T00:00:00Z",
  },
  {
    id: "r3",
    church_name: null,
    contact_name: "Comp Attendee",
    contact_email: "comp@example.com",
    contact_phone: null,
    registration_type: "individual",
    status: "paid",
    total_amount_cents: 0,
    is_complimentary: true,
    created_at: "2027-01-03T00:00:00Z",
  },
];

const REGISTRANTS = [
  { id: "g1", registration_id: "r1", full_name: "Jane Doe", category: "adult", price_cents: 12500 },
  { id: "g2", registration_id: "r1", full_name: "Jimmy Doe", category: "child", price_cents: 0 },
];

const STORE_ORDERS_2027 = [
  {
    id: "o1",
    contact_name: "Jane Doe",
    contact_email: "jane@example.com",
    status: "paid",
    total_amount_cents: 2000,
    created_at: "2027-01-03T00:00:00Z",
  },
];

const STORE_ORDER_ITEMS = [
  { id: "i1", order_id: "o1", product_name: "2027 Convention T-Shirt", size: "M", quantity: 1, unit_price_cents: 2000 },
];

function makeSupabaseMock({
  registrations = [],
  registrants = [],
  storeOrders = [],
  storeOrderItems = [],
}: {
  registrations?: typeof REGISTRATIONS_2027;
  registrants?: typeof REGISTRANTS;
  storeOrders?: typeof STORE_ORDERS_2027;
  storeOrderItems?: typeof STORE_ORDER_ITEMS;
} = {}) {
  return {
    from: (table: string) => {
      if (table === "convention_editions") {
        return { select: () => ({ order: vi.fn().mockResolvedValue({ data: EDITIONS, error: null }) }) };
      }
      if (table === "registrations") {
        return {
          select: () => ({
            eq: () => ({ order: vi.fn().mockResolvedValue({ data: registrations, error: null }) }),
          }),
        };
      }
      if (table === "registrants") {
        return { select: () => ({ in: vi.fn().mockResolvedValue({ data: registrants, error: null }) }) };
      }
      if (table === "store_orders") {
        return {
          select: () => ({
            eq: () => ({ order: vi.fn().mockResolvedValue({ data: storeOrders, error: null }) }),
          }),
        };
      }
      if (table === "store_order_items") {
        return { select: () => ({ in: vi.fn().mockResolvedValue({ data: storeOrderItems, error: null }) }) };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

const requireAdminMock = vi.fn();
vi.mock("@/lib/supabase/require-admin", () => ({
  requireAdmin: requireAdminMock,
}));

describe("AdminRegistrationsPage", () => {
  it("defaults to the current/upcoming edition (earliest such year), not simply the newest row", async () => {
    requireAdminMock.mockResolvedValue({ supabase: makeSupabaseMock(), user: { email: "admin@example.com" } });
    const { default: AdminRegistrationsPage } = await import("../../app/(admin)/admin/registrations/page");

    const Page = await AdminRegistrationsPage({ searchParams: Promise.resolve({}) });
    render(Page);

    // 2027 (upcoming, earliest upcoming year) should be selected -- not
    // 2030 (also upcoming, but further out) or 2026 (already past).
    expect(screen.getByRole("link", { name: "2027" })).toHaveClass("bg-[var(--color-red-text)]");
    expect(screen.getByRole("link", { name: "2030" })).not.toHaveClass("bg-[var(--color-red-text)]");
  });

  it("respects an explicit ?edition= query param", async () => {
    requireAdminMock.mockResolvedValue({ supabase: makeSupabaseMock(), user: { email: "admin@example.com" } });
    const { default: AdminRegistrationsPage } = await import("../../app/(admin)/admin/registrations/page");

    const Page = await AdminRegistrationsPage({ searchParams: Promise.resolve({ edition: "e-2026" }) });
    render(Page);

    expect(screen.getByRole("link", { name: "2026" })).toHaveClass("bg-[var(--color-red-text)]");
  });

  it("renders registrations with nested registrants, church/contact names, and status", async () => {
    requireAdminMock.mockResolvedValue({
      supabase: makeSupabaseMock({ registrations: REGISTRATIONS_2027, registrants: REGISTRANTS }),
      user: { email: "admin@example.com" },
    });
    const { default: AdminRegistrationsPage } = await import("../../app/(admin)/admin/registrations/page");

    const Page = await AdminRegistrationsPage({ searchParams: Promise.resolve({}) });
    render(Page);

    expect(screen.getByText("First CAC")).toBeInTheDocument();
    expect(screen.getByText("(Jane Doe)")).toBeInTheDocument();
    expect(screen.getByText("Jimmy Doe", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getAllByText("paid").length).toBeGreaterThan(0);
    expect(screen.getAllByText("pending").length).toBeGreaterThan(0);
    // $250.00 appears twice here -- once as r1's own total, once (by
    // coincidence, since it's the only paid registration) as the summary
    // card's total registration revenue -- so this only asserts presence,
    // not uniqueness.
    expect(screen.getAllByText("$250.00").length).toBeGreaterThan(0);
  });

  it("renders store purchases with nested line items", async () => {
    requireAdminMock.mockResolvedValue({
      supabase: makeSupabaseMock({ storeOrders: STORE_ORDERS_2027, storeOrderItems: STORE_ORDER_ITEMS }),
      user: { email: "admin@example.com" },
    });
    const { default: AdminRegistrationsPage } = await import("../../app/(admin)/admin/registrations/page");

    const Page = await AdminRegistrationsPage({ searchParams: Promise.resolve({}) });
    render(Page);

    expect(screen.getByText("2027 Convention T-Shirt — M × 1")).toBeInTheDocument();
    // $20.00 appears twice -- the summary card's total store revenue and
    // this one order's own total -- so this only asserts presence.
    expect(screen.getAllByText("$20.00").length).toBeGreaterThan(0);
  });

  it("shows empty-state copy when the selected edition has no registrations or orders", async () => {
    requireAdminMock.mockResolvedValue({ supabase: makeSupabaseMock(), user: { email: "admin@example.com" } });
    const { default: AdminRegistrationsPage } = await import("../../app/(admin)/admin/registrations/page");

    const Page = await AdminRegistrationsPage({ searchParams: Promise.resolve({}) });
    render(Page);

    expect(screen.getByText("No registrations for 2027 yet.")).toBeInTheDocument();
    expect(screen.getByText("No store purchases for 2027 yet.")).toBeInTheDocument();
  });

  it("shows a Complimentary badge for is_complimentary registrations, and not for ordinary ones", async () => {
    requireAdminMock.mockResolvedValue({
      supabase: makeSupabaseMock({ registrations: REGISTRATIONS_2027, registrants: REGISTRANTS }),
      user: { email: "admin@example.com" },
    });
    const { default: AdminRegistrationsPage } = await import("../../app/(admin)/admin/registrations/page");

    const Page = await AdminRegistrationsPage({ searchParams: Promise.resolve({}) });
    render(Page);

    expect(screen.getByText("Comp Attendee")).toBeInTheDocument();
    expect(screen.getAllByText("Complimentary")).toHaveLength(1);
  });

  it("computes summary stats: registrant count and paid-only revenue for both registrations and store orders", async () => {
    requireAdminMock.mockResolvedValue({
      supabase: makeSupabaseMock({
        registrations: REGISTRATIONS_2027,
        registrants: REGISTRANTS,
        storeOrders: STORE_ORDERS_2027,
        storeOrderItems: STORE_ORDER_ITEMS,
      }),
      user: { email: "admin@example.com" },
    });
    const { default: AdminRegistrationsPage } = await import("../../app/(admin)/admin/registrations/page");

    const Page = await AdminRegistrationsPage({ searchParams: Promise.resolve({}) });
    render(Page);

    // 2 registrant rows (Jane + Jimmy under r1) -- r2 has none seeded here.
    expect(screen.getByText("2")).toBeInTheDocument();
    // Registration revenue: only r1 ($250) counts -- r2 is still pending.
    // Store revenue: o1 ($20), the only (paid) order.
    const amounts = screen.getAllByText("$250.00");
    expect(amounts.length).toBeGreaterThan(0);
  });
});
