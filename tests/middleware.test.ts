import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const getUserMock = vi.fn(async () => ({ data: { user: null } }));
const createServerClientMock = vi.fn(() => ({
  auth: { getUser: getUserMock },
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

const intlMiddlewareMock = vi.fn(() => NextResponse.next());
const createIntlMiddlewareMock = vi.fn(() => intlMiddlewareMock);
vi.mock("next-intl/middleware", () => ({
  default: createIntlMiddlewareMock,
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  createServerClientMock.mockClear();
  getUserMock.mockClear();
  intlMiddlewareMock.mockClear();
});

describe("middleware", () => {
  it("routes /admin requests through the Supabase session-refresh branch", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/admin"));

    await middleware(request);

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({ cookies: expect.any(Object) })
    );
    expect(getUserMock).toHaveBeenCalled();
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("routes /admin/login requests through the Supabase session-refresh branch", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/admin/login"));

    await middleware(request);

    expect(createServerClientMock).toHaveBeenCalled();
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("routes non-admin requests through the next-intl middleware branch", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/en"));

    await middleware(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("routes the root path through the next-intl middleware branch", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/"));

    await middleware(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
    expect(createServerClientMock).not.toHaveBeenCalled();
  });
});
