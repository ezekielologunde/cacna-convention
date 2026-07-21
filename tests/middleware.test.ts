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

  it("bypasses /auth/* paths entirely -- neither intl nor session-refresh runs", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/auth/callback?code=abc"));

    await middleware(request);

    expect(intlMiddlewareMock).not.toHaveBeenCalled();
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it("layers attendee session refresh onto next-intl's own response for /en/account, never replacing it", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/en/account"));

    await middleware(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
    const intlResponse = intlMiddlewareMock.mock.results[0]!.value;
    expect(updateSessionMock).toHaveBeenCalledWith(request, intlResponse, "sb-cacna-site-auth-token");
  });

  it("also scopes attendee session refresh to /yo/account/login", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/yo/account/login"));

    await middleware(request);

    expect(updateSessionMock).toHaveBeenCalledWith(
      request,
      expect.anything(),
      "sb-cacna-site-auth-token"
    );
  });

  it("does not scope session refresh to unrelated paths that merely start with the same letters", async () => {
    const { default: middleware } = await import("../middleware");
    const request = new NextRequest(new URL("https://example.com/en/accountability"));

    await middleware(request);

    expect(updateSessionMock).not.toHaveBeenCalled();
  });
});
