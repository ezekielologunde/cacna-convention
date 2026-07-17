import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const getUserMock = vi.fn(async () => ({ data: { user: null } }));
const createServerClientMock = vi.fn(() => ({
  auth: { getUser: getUserMock },
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  createServerClientMock.mockClear();
  getUserMock.mockClear();
});

describe("updateSession", () => {
  it("builds a Supabase server client with the configured URL and anon key", async () => {
    const { updateSession } = await import("../../lib/supabase/middleware");
    const request = new NextRequest(new URL("https://example.com/admin"));

    await updateSession(request);

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });

  it("refreshes the session by calling auth.getUser()", async () => {
    const { updateSession } = await import("../../lib/supabase/middleware");
    const request = new NextRequest(new URL("https://example.com/admin"));

    await updateSession(request);

    expect(getUserMock).toHaveBeenCalled();
  });

  it("returns a NextResponse", async () => {
    const { updateSession } = await import("../../lib/supabase/middleware");
    const request = new NextRequest(new URL("https://example.com/admin"));

    const response = await updateSession(request);

    expect(response).toBeInstanceOf(Response);
  });
});
