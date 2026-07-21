import { describe, it, expect, vi, beforeEach } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const getUserMock = vi.fn();
const createAttendeeClientMock = vi.fn(async () => ({
  auth: { getUser: getUserMock },
}));

vi.mock("@/lib/supabase/server", () => ({
  createAttendeeClient: createAttendeeClientMock,
}));

beforeEach(() => {
  redirectMock.mockClear();
  getUserMock.mockReset();
});

describe("requireAttendee", () => {
  it("redirects to the locale-prefixed login page when there is no authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { requireAttendee } = await import("../../lib/supabase/require-attendee");

    await expect(requireAttendee("en")).rejects.toThrow("REDIRECT:/en/account/login");
  });

  it("respects the locale argument when redirecting", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { requireAttendee } = await import("../../lib/supabase/require-attendee");

    await expect(requireAttendee("yo")).rejects.toThrow("REDIRECT:/yo/account/login");
  });

  it("returns the attendee client and user when authenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { requireAttendee } = await import("../../lib/supabase/require-attendee");

    const result = await requireAttendee("en");
    expect(result.user).toEqual({ id: "user-1" });
  });
});
