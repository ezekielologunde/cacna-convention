import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

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

  it("omits cookieOptions when no cookie name is given (default/admin client)", async () => {
    const { updateSession } = await import("../../lib/supabase/middleware");
    const request = new NextRequest(new URL("https://example.com/admin"));

    await updateSession(request);

    const [, , options] = createServerClientMock.mock.calls.at(-1)!;
    expect((options as { cookieOptions?: unknown }).cookieOptions).toBeUndefined();
  });

  it("passes cookieOptions with the given cookie name (attendee client)", async () => {
    const { updateSession } = await import("../../lib/supabase/middleware");
    const request = new NextRequest(new URL("https://example.com/en/account"));

    await updateSession(request, undefined, "sb-cacna-site-auth-token");

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({ cookieOptions: { name: "sb-cacna-site-auth-token" } })
    );
  });

  // This is the highest-risk behavior in the whole accounts feature (per
  // the implementation plan): composing session-refresh with next-intl's
  // own response. Getting it wrong -- constructing a fresh response
  // instead of writing onto the one already produced by another
  // middleware in the chain -- would silently discard a locale
  // redirect/rewrite. Verified here by actually driving the mocked
  // client's cookies.setAll callback the way the real Supabase client
  // would during a token refresh, and asserting identity + cookie value
  // land on the SAME externally-provided response object.
  it("writes refreshed cookies onto an externally-provided response instead of replacing it", async () => {
    let capturedSetAll:
      | ((cookies: { name: string; value: string; options: Record<string, unknown> }[]) => void)
      | undefined;
    createServerClientMock.mockImplementationOnce((_url, _key, options) => {
      capturedSetAll = (
        options as {
          cookies: {
            setAll: (
              cookies: { name: string; value: string; options: Record<string, unknown> }[]
            ) => void;
          };
        }
      ).cookies.setAll;
      return { auth: { getUser: getUserMock } };
    });

    const { updateSession } = await import("../../lib/supabase/middleware");
    const request = new NextRequest(new URL("https://example.com/en/account"));
    const externalResponse = NextResponse.redirect(new URL("https://example.com/en"));

    const result = await updateSession(request, externalResponse, "sb-cacna-site-auth-token");
    capturedSetAll!([{ name: "sb-access-token", value: "refreshed", options: {} }]);

    expect(result).toBe(externalResponse);
    expect(result.headers.get("location")).toBe("https://example.com/en");
    expect(result.cookies.get("sb-access-token")?.value).toBe("refreshed");
  });
});
