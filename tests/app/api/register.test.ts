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
const deleteRegistrationMock = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
const insertRegistrantsMock = vi.fn();
const deleteRegistrantsMock = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
const createServiceClientMock = vi.fn(() => ({
  from: (table: string) => {
    if (table === "registrations") {
      return {
        insert: insertRegistrationMock,
        update: updateRegistrationMock,
        delete: deleteRegistrationMock,
      };
    }
    if (table === "registrants") {
      return {
        insert: insertRegistrantsMock,
        delete: deleteRegistrantsMock,
      };
    }
    throw new Error(`unexpected table ${table}`);
  },
}));
// The route also checks for a signed-in attendee session (to link the
// registration to their account) via a second, independent client — mocked
// here as always-signed-out so every existing anonymous-registration test
// keeps its prior behavior unchanged.
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
  getActivePricingMock.mockReset();
  insertRegistrationMock.mockReset();
  insertRegistrantsMock.mockReset();
  checkoutSessionsCreateMock.mockReset();

  // Reset call history for cleanup-path assertions but keep working defaults
  // (mockReset() would otherwise wipe the return value too).
  deleteRegistrationMock.mockReset();
  deleteRegistrationMock.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  deleteRegistrantsMock.mockReset();
  deleteRegistrantsMock.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
});

function validRequestInit(overrides: Record<string, unknown> = {}) {
  return {
    method: "POST",
    body: JSON.stringify({
      registrationType: "individual",
      churchName: null,
      contactName: "Jane Doe",
      contactEmail: "jane@example.com",
      contactPhone: "",
      registrants: [{ fullName: "Jane Doe", category: "adult" }],
      ...overrides,
    }),
  };
}

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
    // A second line item carries the 4% card processing fee (12500 * 0.04 = 500).
    const createArgs = checkoutSessionsCreateMock.mock.calls[0][0];
    expect(createArgs.line_items).toEqual([
      expect.objectContaining({
        price_data: expect.objectContaining({ unit_amount: 12500 }),
        quantity: 1,
      }),
      expect.objectContaining({
        price_data: expect.objectContaining({
          unit_amount: 500,
          product_data: expect.objectContaining({ name: "Card Processing Fee (4%)" }),
        }),
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

  describe("free child registrants (Finding 1)", () => {
    it("skips Stripe entirely for a child-only registration and returns a confirmation URL with status paid", async () => {
      getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
      // Deliberately no "child" tier — proves child pricing never queries pricing_tiers.
      getActivePricingMock.mockResolvedValue([{ category: "adult", price_cents: 12500 }]);
      insertRegistrationMock.mockReturnValue({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "reg-child-1" }, error: null }),
        }),
      });
      insertRegistrantsMock.mockResolvedValue({ error: null });

      const { POST } = await import("../../../app/api/register/route");
      const request = new Request(
        "http://localhost/api/register",
        validRequestInit({ registrants: [{ fullName: "Kid One", category: "child" }] })
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        checkoutUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/register/confirmation?registration=reg-child-1`,
      });

      // Stripe must never be called for a $0 total.
      expect(checkoutSessionsCreateMock).not.toHaveBeenCalled();

      // The registration is marked paid directly.
      expect(updateRegistrationMock).toHaveBeenCalledWith({ status: "paid" });

      const insertedRegistrants = insertRegistrantsMock.mock.calls[0][0];
      expect(insertedRegistrants).toEqual([
        expect.objectContaining({ full_name: "Kid One", category: "child", price_cents: 0 }),
      ]);
    });

    it("only creates a Stripe line item for the paying adult in a mixed adult+child registration, but still stores the child's $0 price", async () => {
      getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
      getActivePricingMock.mockResolvedValue([{ category: "adult", price_cents: 12500 }]);
      insertRegistrationMock.mockReturnValue({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "reg-mixed-1" }, error: null }),
        }),
      });
      insertRegistrantsMock.mockResolvedValue({ error: null });
      checkoutSessionsCreateMock.mockResolvedValue({
        id: "cs_test_mixed",
        url: "https://checkout.stripe.com/pay/cs_test_mixed",
      });

      const { POST } = await import("../../../app/api/register/route");
      const request = new Request(
        "http://localhost/api/register",
        validRequestInit({
          registrants: [
            { fullName: "Adult One", category: "adult" },
            { fullName: "Kid One", category: "child" },
          ],
        })
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ checkoutUrl: "https://checkout.stripe.com/pay/cs_test_mixed" });

      // The free child registrant contributes no Stripe line item, and no
      // fee is charged on their $0 share -- 2 line items total: the paying
      // adult, plus the 4% fee computed on just that adult's price.
      const createArgs = checkoutSessionsCreateMock.mock.calls[0][0];
      expect(createArgs.line_items).toHaveLength(2);
      expect(createArgs.line_items[0]).toEqual(
        expect.objectContaining({
          price_data: expect.objectContaining({ unit_amount: 12500 }),
          quantity: 1,
        })
      );
      expect(createArgs.line_items[1]).toEqual(
        expect.objectContaining({
          price_data: expect.objectContaining({
            unit_amount: 500,
            product_data: expect.objectContaining({ name: "Card Processing Fee (4%)" }),
          }),
          quantity: 1,
        })
      );

      const insertedRegistrants = insertRegistrantsMock.mock.calls[0][0];
      expect(insertedRegistrants).toEqual([
        expect.objectContaining({ full_name: "Adult One", category: "adult", price_cents: 12500 }),
        expect.objectContaining({ full_name: "Kid One", category: "child", price_cents: 0 }),
      ]);
    });
  });

  describe("card processing fee", () => {
    it("adds a 4% fee line item matching the Payment Options page's $100 -> $104 example", async () => {
      getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
      // A $100.00 category, matching the exact example in
      // lib/content/payment-options.ts's card-fee copy.
      getActivePricingMock.mockResolvedValue([{ category: "young_adult", price_cents: 10000 }]);
      insertRegistrationMock.mockReturnValue({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "reg-fee-1" }, error: null }),
        }),
      });
      insertRegistrantsMock.mockResolvedValue({ error: null });
      checkoutSessionsCreateMock.mockResolvedValue({
        id: "cs_test_fee",
        url: "https://checkout.stripe.com/pay/cs_test_fee",
      });

      const { POST } = await import("../../../app/api/register/route");
      const request = new Request(
        "http://localhost/api/register",
        validRequestInit({ registrants: [{ fullName: "Jane Doe", category: "young_adult" }] })
      );

      const response = await POST(request);
      expect(response.status).toBe(200);

      const createArgs = checkoutSessionsCreateMock.mock.calls[0][0];
      expect(createArgs.line_items).toHaveLength(2);
      expect(createArgs.line_items[0].price_data.unit_amount).toBe(10000);
      // $100.00 fee becomes $104.00 -- the $4.00 difference is this line item.
      expect(createArgs.line_items[1]).toEqual(
        expect.objectContaining({
          price_data: expect.objectContaining({
            unit_amount: 400,
            product_data: expect.objectContaining({ name: "Card Processing Fee (4%)" }),
          }),
          quantity: 1,
        })
      );

      // The stored registration/registrant amounts stay at the base fee --
      // the surcharge is a Stripe-checkout-only addition, never persisted.
      const insertedRegistration = insertRegistrationMock.mock.calls[0][0];
      expect(insertedRegistration.total_amount_cents).toBe(10000);
      const insertedRegistrants = insertRegistrantsMock.mock.calls[0][0];
      expect(insertedRegistrants[0].price_cents).toBe(10000);
    });

    it("charges no fee (and skips Stripe) for a $0 child-only registration", async () => {
      getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
      getActivePricingMock.mockResolvedValue([{ category: "adult", price_cents: 12500 }]);
      insertRegistrationMock.mockReturnValue({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "reg-fee-child" }, error: null }),
        }),
      });
      insertRegistrantsMock.mockResolvedValue({ error: null });

      const { POST } = await import("../../../app/api/register/route");
      const request = new Request(
        "http://localhost/api/register",
        validRequestInit({ registrants: [{ fullName: "Kid One", category: "child" }] })
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(checkoutSessionsCreateMock).not.toHaveBeenCalled();
    });
  });

  describe("input validation (Finding 2)", () => {
    it("returns 400 and touches no database when registrants is an empty array", async () => {
      const { POST } = await import("../../../app/api/register/route");
      const request = new Request(
        "http://localhost/api/register",
        validRequestInit({ registrants: [] })
      );

      const response = await POST(request);
      expect(response.status).toBe(400);

      expect(getActiveEditionMock).not.toHaveBeenCalled();
      expect(insertRegistrationMock).not.toHaveBeenCalled();
      expect(insertRegistrantsMock).not.toHaveBeenCalled();
    });

    it("returns 400 when a registrant's category is not one of the valid literals", async () => {
      const { POST } = await import("../../../app/api/register/route");
      const request = new Request(
        "http://localhost/api/register",
        validRequestInit({ registrants: [{ fullName: "Jane Doe", category: "senior" }] })
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(getActiveEditionMock).not.toHaveBeenCalled();
    });

    it("returns 400 when contactEmail is missing", async () => {
      const { POST } = await import("../../../app/api/register/route");
      const request = new Request(
        "http://localhost/api/register",
        validRequestInit({ contactEmail: "" })
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(getActiveEditionMock).not.toHaveBeenCalled();
    });

    it("returns 400 (not an unhandled 500) when the request body is malformed JSON", async () => {
      const { POST } = await import("../../../app/api/register/route");
      const request = new Request("http://localhost/api/register", {
        method: "POST",
        body: "{not valid json",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(getActiveEditionMock).not.toHaveBeenCalled();
    });
  });

  describe("cleanup on partial failure (Finding 2)", () => {
    it("deletes the registration row if the registrants insert fails", async () => {
      getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
      getActivePricingMock.mockResolvedValue([{ category: "adult", price_cents: 12500 }]);
      insertRegistrationMock.mockReturnValue({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "reg-fail-1" }, error: null }),
        }),
      });
      insertRegistrantsMock.mockResolvedValue({ error: { message: "insert failed" } });

      const { POST } = await import("../../../app/api/register/route");
      const request = new Request("http://localhost/api/register", validRequestInit());

      const response = await POST(request);
      expect(response.status).toBe(500);

      // Only the registration row needs cleanup — the registrants insert itself failed.
      expect(deleteRegistrantsMock).not.toHaveBeenCalled();
      expect(deleteRegistrationMock).toHaveBeenCalledTimes(1);
    });

    it("deletes both the registrants and registration rows if Stripe session creation throws", async () => {
      getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
      getActivePricingMock.mockResolvedValue([{ category: "adult", price_cents: 12500 }]);
      insertRegistrationMock.mockReturnValue({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "reg-fail-2" }, error: null }),
        }),
      });
      insertRegistrantsMock.mockResolvedValue({ error: null });
      checkoutSessionsCreateMock.mockRejectedValue(new Error("Stripe is down"));

      const { POST } = await import("../../../app/api/register/route");
      const request = new Request("http://localhost/api/register", validRequestInit());

      const response = await POST(request);
      expect(response.status).toBe(500);

      expect(deleteRegistrantsMock).toHaveBeenCalledTimes(1);
      expect(deleteRegistrationMock).toHaveBeenCalledTimes(1);
    });
  });
});
