import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { welcomeMessage } from "../../lib/content/welcome";

// `next-intl/server`'s real (react-server) implementation of
// `getTranslations`/`setRequestLocale` needs an actual Next.js RSC request
// context (it reaches for `next/headers` under the hood). Outside of that —
// e.g. here, where the test imports the page module directly and calls it
// as a plain function — package resolution falls back to next-intl's
// non-RSC stub build, which throws `"... is not supported in Client
// Components."` for every export. Confirmed by actually running this test
// without the mock first (threw exactly that error from `setRequestLocale`
// in app/(site)/[locale]/page.tsx). That's a Vitest/Node module-resolution
// limitation, not a bug in the page: Next.js itself resolves the real
// react-server build at build/runtime. Mock the module here so the page's
// translation calls resolve against the real `en.json` copy instead of the
// stub. (Same pattern established in tests/app/plan-your-visit.test.tsx,
// tests/app/archive.test.tsx, tests/app/contact.test.tsx.)
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

// The homepage now calls `getActiveEdition` (via `@/lib/supabase/server`)
// the same way the Schedule page does, to decide whether to show real
// pricing or the "registration hasn't opened yet" copy. Mock the
// `convention_editions` query chain to resolve no active edition — the
// same state the real (unseeded) database is in today — so this test
// exercises the actual no-edition path rather than skipping the query.
const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

function mockNoActiveEdition() {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  createClientMock.mockResolvedValue({
    from: () => ({ select: () => ({ in: inMock }) }),
  });
}

describe("HomePage", () => {
  it("renders quick links to About and Schedule", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "Learn More" })).toHaveAttribute("href", "/en/about");
    expect(screen.getByRole("link", { name: "View Schedule" })).toHaveAttribute("href", "/en/schedule");
  });

  it("shows the registration-not-open copy when there is no active edition", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText(
        "Registration for 2027 opens in January — pricing and exact dates will be posted here as soon as they're confirmed."
      )
    ).toBeInTheDocument();
  });

  it("renders the kicker and welcome message", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("2027 · CAC Village, USA")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome to CACNA Convention" })).toBeInTheDocument();
    expect(screen.getByText(welcomeMessage.paragraphs[0])).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/en/contact");
  });

  it("renders a Gallery CTA linking to the gallery page", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "View Gallery" })).toHaveAttribute("href", "/en/gallery");
  });
});
