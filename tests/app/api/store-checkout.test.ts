import { describe, it, expect, vi, beforeEach } from "vitest";

const getActiveEditionMock = vi.fn();
vi.mock("@/lib/editions", () => ({
  getActiveEdition: getActiveEditionMock,
}));

const PRODUCT = { id: "p1", name: "2027 Convention T-Shirt", price_cents: 2000, sizes: ["M", "L"], active: true };

const productsInMock = vi.fn().mockResolvedValue({ data: [PRODUCT], error: null });
const productsEqMock = vi.fn(() => ({ in: productsInMock }));
const orderInsertSelectSingleMock = vi.fn();
const orderInsertMock = vi.fn(() => ({ select: () => ({ single: orderInsertSelectSingleMock }) }));
const orderItemsInsertMock = vi.fn().mockResolvedValue({ error: null });
const orderUpdateEqMock = vi.fn().mockResolvedValue({ error: null });

const createServiceClientMock = vi.fn(() => ({
  from: (table: string) => {
    if (table === "store_products") {
      return { select: () => ({ eq: productsEqMock }) };
    }
    if (table === "store_orders") {
      return { insert: orderInsertMock, update: () => ({ eq: orderUpdateEqMock }) };
    }
    if (table === "store_order_items") {
      return { insert: orderItemsInsertMock };
    }
    throw new Error(`unexpected table ${table}`);
  },
}));

const createAttendeeClientMock = vi.fn(async () => ({
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: createServiceClientMock,
  createAttendeeClient: createAttendeeClientMock,
}));

const checkoutSessionsCreateMock = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    checkout: { sessions: { create: checkoutSessionsCreateMock } },
  }),
}));

beforeEach(() => {
  getActiveEditionMock.mockReset();
  orderInsertMock.mockClear();
  orderInsertSelectSingleMock.mockReset();
  orderInsertSelectSingleMock.mockResolvedValue({
    data: { id: "order-1", contact_name: "Jane Doe", contact_email: "jane@example.com", total_amount_cents: 2000 },
    error: null,
  });
  orderItemsInsertMock.mockClear();
  checkoutSessionsCreateMock.mockReset();
  checkoutSessionsCreateMock.mockResolvedValue({ id: "cs_123", url: "https://checkout.stripe.com/cs_123" });
});

function validRequest() {
  return new Request("http://localhost/api/store/checkout", {
    method: "POST",
    body: JSON.stringify({
      contactName: "Jane Doe",
      contactEmail: "jane@example.com",
      items: [{ productId: "p1", size: "M", quantity: 1 }],
    }),
  });
}

describe("POST /api/store/checkout", () => {
  it("stamps the order with whatever edition is currently active", async () => {
    getActiveEditionMock.mockResolvedValue({ id: "edition-2027", year: 2027 });
    const { POST } = await import("../../../app/api/store/checkout/route");

    await POST(validRequest());

    expect(orderInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ edition_id: "edition-2027" })
    );
  });

  it("falls back to a null edition_id when nothing is active/upcoming, without blocking checkout", async () => {
    getActiveEditionMock.mockResolvedValue(null);
    const { POST } = await import("../../../app/api/store/checkout/route");

    const res = await POST(validRequest());
    const json = await res.json();

    expect(orderInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ edition_id: null })
    );
    expect(json.checkoutUrl).toBe("https://checkout.stripe.com/cs_123");
  });
});
