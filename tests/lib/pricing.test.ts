import { describe, it, expect, vi } from "vitest";
import { getActivePricingForEdition, priceForCategory } from "../../lib/pricing";

describe("getActivePricingForEdition", () => {
  it("queries pricing_tiers filtered by edition and today's date window", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ id: "t1", category: "adult", price_cents: 12500 }],
      error: null,
    });
    const gteMock = vi.fn(() => ({ order: orderMock }));
    const lteMock = vi.fn(() => ({ gte: gteMock }));
    const eqMock = vi.fn(() => ({ lte: lteMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    // Noon UTC is unambiguous: it's still the same calendar date in
    // America/New_York (07:00 EST / 08:00 EDT), so this exercises the
    // "normal" case without touching the UTC-vs-Eastern boundary.
    const result = await getActivePricingForEdition(
      supabase,
      "edition-1",
      new Date("2026-03-01T12:00:00Z")
    );

    expect(fromMock).toHaveBeenCalledWith("pricing_tiers");
    expect(eqMock).toHaveBeenCalledWith("edition_id", "edition-1");
    expect(lteMock).toHaveBeenCalledWith("starts_on", "2026-03-01");
    expect(gteMock).toHaveBeenCalledWith("ends_on", "2026-03-01");
    expect(result).toEqual([{ id: "t1", category: "adult", price_cents: 12500 }]);
  });

  it("uses the Eastern-time calendar date near a UTC day boundary, not the UTC date", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ id: "t1", category: "adult", price_cents: 12500 }],
      error: null,
    });
    const gteMock = vi.fn(() => ({ order: orderMock }));
    const lteMock = vi.fn(() => ({ gte: gteMock }));
    const eqMock = vi.fn(() => ({ lte: lteMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    // 2026-03-01T23:30:00-05:00 (11:30pm Eastern) is 2026-03-02T04:30:00Z in
    // UTC. The old `onDate.toISOString().slice(0, 10)` logic would resolve
    // this to "2026-03-02", incorrectly rolling the pricing tier over a few
    // hours early. The Eastern-time-aware logic must still resolve to
    // "2026-03-01".
    const result = await getActivePricingForEdition(
      supabase,
      "edition-1",
      new Date("2026-03-01T23:30:00-05:00")
    );

    expect(lteMock).toHaveBeenCalledWith("starts_on", "2026-03-01");
    expect(gteMock).toHaveBeenCalledWith("ends_on", "2026-03-01");
    expect(result).toEqual([{ id: "t1", category: "adult", price_cents: 12500 }]);
  });
});

describe("priceForCategory", () => {
  it("returns the price for a matching category", () => {
    const tiers = [{ category: "adult", price_cents: 12500 }] as never;
    expect(priceForCategory(tiers, "adult")).toBe(12500);
  });

  it("returns null when no tier matches the category", () => {
    const tiers = [{ category: "adult", price_cents: 12500 }] as never;
    expect(priceForCategory(tiers, "child")).toBeNull();
  });
});
