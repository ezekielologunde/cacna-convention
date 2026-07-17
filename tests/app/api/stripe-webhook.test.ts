import { describe, it, expect, vi, beforeEach } from "vitest";

const constructEventMock = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    webhooks: { constructEvent: constructEventMock },
  }),
}));

const updateMock = vi.fn();
const eqMock = vi.fn(() => Promise.resolve({ error: null }));
const createServiceClientMock = vi.fn(() => ({
  from: () => ({
    update: (patch: unknown) => {
      updateMock(patch);
      return { eq: eqMock };
    },
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: createServiceClientMock,
}));

beforeEach(() => {
  constructEventMock.mockReset();
  updateMock.mockReset();
  eqMock.mockClear();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

describe("POST /api/stripe/webhook", () => {
  it("marks a registration paid on checkout.session.completed", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          payment_intent: "pi_test_123",
          metadata: { registration_id: "reg-1" },
        },
      },
    });

    const { POST } = await import("../../../app/api/stripe/webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig_test" },
      body: "raw-body",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "paid", stripe_payment_intent_id: "pi_test_123" })
    );
    expect(eqMock).toHaveBeenCalledWith("id", "reg-1");
  });

  it("marks a registration failed on payment_intent.payment_failed", async () => {
    constructEventMock.mockReturnValue({
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: "pi_test_456",
          metadata: { registration_id: "reg-2" },
        },
      },
    });

    const { POST } = await import("../../../app/api/stripe/webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig_test" },
      body: "raw-body",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: "failed" }));
    expect(eqMock).toHaveBeenCalledWith("id", "reg-2");
  });

  it("returns 400 when signature verification fails", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const { POST } = await import("../../../app/api/stripe/webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "bad_sig" },
      body: "raw-body",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
