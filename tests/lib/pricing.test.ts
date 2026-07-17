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

    const result = await getActivePricingForEdition(supabase, "edition-1", new Date("2026-03-01"));

    expect(fromMock).toHaveBeenCalledWith("pricing_tiers");
    expect(eqMock).toHaveBeenCalledWith("edition_id", "edition-1");
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
