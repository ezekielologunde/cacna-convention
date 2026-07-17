import { describe, it, expect, vi, beforeEach } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const getUserMock = vi.fn();
const createClientMock = vi.fn(async () => ({
  auth: { getUser: getUserMock },
}));

const singleMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: singleMock,
      }),
    }),
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
  createServiceClient: createServiceClientMock,
}));

beforeEach(() => {
  redirectMock.mockClear();
  getUserMock.mockReset();
  singleMock.mockReset();
});

describe("requireAdmin", () => {
  it("redirects to /admin/login when there is no authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { requireAdmin } = await import("../../lib/supabase/require-admin");

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("redirects with an unauthorized error when the user has no admin_profiles row", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    singleMock.mockResolvedValue({ data: null });
    const { requireAdmin } = await import("../../lib/supabase/require-admin");

    await expect(requireAdmin()).rejects.toThrow(
      "REDIRECT:/admin/login?error=unauthorized"
    );
  });

  it("returns the service client and user when the admin_profiles row exists", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    singleMock.mockResolvedValue({ data: { id: "user-1" } });
    const { requireAdmin } = await import("../../lib/supabase/require-admin");

    const result = await requireAdmin();
    expect(result.user).toEqual({ id: "user-1" });
  });
});
