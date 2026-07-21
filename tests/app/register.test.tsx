import { describe, it, expect, vi, beforeEach } from "vitest";

// Registration now lives at the homepage itself (see tests/app/home.test.tsx
// for the substantive fee-card/guidelines/payment-options coverage that
// used to live in this file) -- /register is just a redirect for old
// links/bookmarks. Same mock pattern as tests/lib/require-admin.test.ts's
// existing redirect() coverage, but for permanentRedirect().
const permanentRedirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  permanentRedirect: permanentRedirectMock,
}));

beforeEach(() => {
  permanentRedirectMock.mockClear();
});

describe("RegisterPage", () => {
  it("permanently redirects to the locale homepage", async () => {
    const { default: RegisterPage } = await import("../../app/(site)/[locale]/register/page");

    await expect(
      RegisterPage({ params: Promise.resolve({ locale: "en" }) })
    ).rejects.toThrow("REDIRECT:/en");
  });

  it("redirects to the correct homepage for a different locale", async () => {
    const { default: RegisterPage } = await import("../../app/(site)/[locale]/register/page");

    await expect(
      RegisterPage({ params: Promise.resolve({ locale: "yo" }) })
    ).rejects.toThrow("REDIRECT:/yo");
  });
});
