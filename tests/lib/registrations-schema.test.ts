import { describe, it, expect } from "vitest";
import type { Database } from "../../types/database.types";

describe("registrations/registrants schema types", () => {
  it("registrations Row has the expected required fields", () => {
    const row: Database["public"]["Tables"]["registrations"]["Row"] = {
      id: "r1",
      edition_id: "e1",
      attendee_id: null,
      registration_type: "individual",
      church_name: null,
      contact_name: "Jane Doe",
      contact_email: "jane@example.com",
      contact_phone: null,
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: null,
      status: "pending",
      total_amount_cents: 12500,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };
    expect(row.status).toBe("pending");
  });

  it("registrants Row has the expected required fields", () => {
    const row: Database["public"]["Tables"]["registrants"]["Row"] = {
      id: "g1",
      registration_id: "r1",
      full_name: "Jane Doe",
      category: "adult",
      price_cents: 12500,
      created_at: "2026-01-01T00:00:00Z",
    };
    expect(row.category).toBe("adult");
  });
});
