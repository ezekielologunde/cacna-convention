import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const exchangeCodeForSessionMock = vi.fn();
const upsertMock = vi.fn();
const createAttendeeClientMock = vi.fn(async () => ({
  auth: { exchangeCodeForSession: exchangeCodeForSessionMock },
  from: () => ({ upsert: upsertMock }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createAttendeeClient: createAttendeeClientMock,
}));

beforeEach(() => {
  exchangeCodeForSessionMock.mockReset();
  upsertMock.mockReset();
  upsertMock.mockResolvedValue({ error: null });
});

describe("GET /auth/callback", () => {
  it("redirects to the default account page when no code is present", async () => {
    const { GET } = await import("../../app/auth/callback/route");
    const request = new NextRequest(new URL("https://example.com/auth/callback"));

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("https://example.com/en/account");
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled();
  });

  it("exchanges the code, upserts the attendee profile, and redirects to next", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "person@example.com" } },
      error: null,
    });

    const { GET } = await import("../../app/auth/callback/route");
    const request = new NextRequest(
      new URL("https://example.com/auth/callback?code=abc123&next=%2Fen%2Faccount")
    );

    const response = await GET(request);

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("abc123");
    expect(upsertMock).toHaveBeenCalledWith(
      { id: "user-1", email: "person@example.com" },
      { onConflict: "id" }
    );
    expect(response.headers.get("location")).toBe("https://example.com/en/account");
  });

  it("redirects to next without upserting when the code exchange fails", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid code" },
    });

    const { GET } = await import("../../app/auth/callback/route");
    const request = new NextRequest(
      new URL("https://example.com/auth/callback?code=bad&next=%2Fyo%2Faccount")
    );

    const response = await GET(request);

    expect(upsertMock).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://example.com/yo/account");
  });
});
