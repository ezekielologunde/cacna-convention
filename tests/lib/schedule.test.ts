import { describe, it, expect, vi } from "vitest";
import { getScheduleForEdition } from "../../lib/schedule";

describe("getScheduleForEdition", () => {
  it("queries schedule_sessions filtered by edition, ordered by day and sort_order", async () => {
    const order2Mock = vi.fn().mockResolvedValue({
      data: [{ id: "s1", day_date: "2026-07-13", title: "Registration" }],
      error: null,
    });
    const orderMock = vi.fn(() => ({ order: order2Mock }));
    const eqMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    const result = await getScheduleForEdition(supabase, "edition-1");

    expect(fromMock).toHaveBeenCalledWith("schedule_sessions");
    expect(eqMock).toHaveBeenCalledWith("edition_id", "edition-1");
    expect(orderMock).toHaveBeenCalledWith("day_date", { ascending: true });
    expect(order2Mock).toHaveBeenCalledWith("sort_order", { ascending: true });
    expect(result).toEqual([{ id: "s1", day_date: "2026-07-13", title: "Registration" }]);
  });
});
