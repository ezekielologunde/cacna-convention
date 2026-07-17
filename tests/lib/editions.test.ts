import { describe, it, expect, vi } from "vitest";
import { getActiveEdition } from "../../lib/editions";

describe("getActiveEdition", () => {
  it("queries convention_editions for current/upcoming status, earliest year first", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: { id: "edition-1", year: 2027 },
      error: null,
    });
    const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
    const orderMock = vi.fn(() => ({ limit: limitMock }));
    const inMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ in: inMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    const result = await getActiveEdition(supabase);

    expect(fromMock).toHaveBeenCalledWith("convention_editions");
    expect(inMock).toHaveBeenCalledWith("status", ["current", "upcoming"]);
    expect(orderMock).toHaveBeenCalledWith("year", { ascending: true });
    expect(result).toEqual({ id: "edition-1", year: 2027 });
  });

  it("returns null when no current/upcoming edition exists", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
    const orderMock = vi.fn(() => ({ limit: limitMock }));
    const inMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ in: inMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    const result = await getActiveEdition(supabase);

    expect(result).toBeNull();
  });
});
