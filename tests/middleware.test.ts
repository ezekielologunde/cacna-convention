import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const updateSessionMock = vi.fn(async () => NextResponse.next());
vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: updateSessionMock,
}));

const intlMiddlewareMock = vi.fn(() => NextResponse.next());
const createIntlMiddlewareMock = vi.fn(() => intlMiddlewareMock);
vi.mock("next-intl/middleware", () => ({
  default: createIntlMiddlewareMock,
}));

beforeEach(() => {
  updateSessionMock.mockClear();
  intlMiddlewareMock.mockClear();
});

describe("middleware", () => {
  it("routes /admin requests through the Supabase session-refresh branch", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/admin"));

    await middleware(request);

    expect(updateSessionMock).toHaveBeenCalledWith(request);
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("routes /admin/login requests through the Supabase session-refresh branch", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/admin/login"));

    await middleware(request);

    expect(updateSessionMock).toHaveBeenCalledWith(request);
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("routes non-admin requests through the next-intl middleware branch", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/en"));

    await middleware(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it("routes the root path through the next-intl middleware branch", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/"));

    await middleware(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
    expect(updateSessionMock).not.toHaveBeenCalled();
  });
});
