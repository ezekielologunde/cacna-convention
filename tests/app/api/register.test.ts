import { describe, it, expect, vi, beforeEach } from "vitest";

const getActiveEditionMock = vi.fn();
vi.mock("@/lib/editions", () => ({
  getActiveEdition: getActiveEditionMock,
}));

const getActivePricingMock = vi.fn();
vi.mock("@/lib/pricing", () => ({
  getActivePricingForEdition: getActivePricingMock,
  priceForCategory: (tiers: { category: string; price_cents: number }[], category: string) =>
    tiers.find((t) => t.category === category)?.price_cents ?? null,
}));

const insertRegistrationMock = vi.fn();
const updateRegistrationMock = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
const insertRegistrantsMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({
  from: (table: string) => {
    if (table === "registrations") {
      return {
        insert: insertRegistrationMock,
        update: updateRegistrationMock,
      };
    }
    if (table === "registrants") {
      return {
        insert: insertRegistrantsMock,
      };
    }
    throw new Error(`unexpected table ${table}`);
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: createServiceClientMock,
}));

const checkoutSessionsCreateMock = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    checkout: { sessions: { create: checkoutSessionsCreateMock } },
  }),
}));

beforeEach(() => {
  getActiveEditionMock.mockReset();
  getActivePricingMock.mockReset();
  insertRegistrationMock.mockReset();
  insertRegistrantsMock.mockReset();
  checkoutSessionsCreateMock.mockReset();
});

describe("POST /api/register", () => {
  it("re-prices every registrant server-side and never trusts a client-supplied price", async () => {
    getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
    getActivePricingMock.mockResolvedValue([
      { category: "adult", price_cents: 12500 },
      { category: "young_adult", price_cents: 10000 },
    ]);
    insertRegistrationMock.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "reg-1" }, error: null }),
      }),
    });
    insertRegistrantsMock.mockResolvedValue({ error: null });
    checkoutSessionsCreateMock.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });

    const { POST } = await import("../../../app/api/register/route");
    const request = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        registrationType: "individual",
        churchName: null,
        contactName: "Jane Doe",
        contactEmail: "jane@example.com",
        contactPhone: "",
        // Client claims a price of $1 — the route must ignore this entirely.
        registrants: [{ fullName: "Jane Doe", category: "adult", price_cents: 100 }],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123" });

    // The Stripe line item must use the server-looked-up price (12500), not the client's (100).
    const createArgs = checkoutSessionsCreateMock.mock.calls[0][0];
    expect(createArgs.line_items).toEqual([
      expect.objectContaining({
        price_data: expect.objectContaining({ unit_amount: 12500 }),
        quantity: 1,
      }),
    ]);

    // The registrants insert must also carry the server-computed price, not the client's.
    const insertedRegistrants = insertRegistrantsMock.mock.calls[0][0];
    expect(insertedRegistrants).toEqual([
      expect.objectContaining({ full_name: "Jane Doe", category: "adult", price_cents: 12500 }),
    ]);
  });

  it("returns 409 when no current/upcoming edition is open for registration", async () => {
    getActiveEditionMock.mockResolvedValue(null);

    const { POST } = await import("../../../app/api/register/route");
    const request = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        registrationType: "individual",
        churchName: null,
        contactName: "Jane Doe",
        contactEmail: "jane@example.com",
        contactPhone: "",
        registrants: [{ fullName: "Jane Doe", category: "adult" }],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  it("returns 400 when a registrant's category has no active price", async () => {
    getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
    getActivePricingMock.mockResolvedValue([{ category: "adult", price_cents: 12500 }]);

    const { POST } = await import("../../../app/api/register/route");
    const request = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        registrationType: "individual",
        churchName: null,
        contactName: "Jane Doe",
        contactEmail: "jane@example.com",
        contactPhone: "",
        registrants: [{ fullName: "Jane Doe", category: "young_adult" }],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
