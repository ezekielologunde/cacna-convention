import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { welcomeMessage } from "../../lib/content/welcome";
import { history } from "../../lib/content/history";
import { leadership } from "../../lib/content/leadership";
import { committee } from "../../lib/content/committee";

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

// The homepage calls both `getActiveEdition` (`.in("status", [...])`) and
// `getMostRecentPastEdition` (`.eq("status", "past")`) against the same
// `convention_editions` table, so `.select()` needs to return an object
// with both `.in` and `.eq` defined -- one mocked chain per query shape.
const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

function mockEditionQueries({
  pastEdition = null,
}: {
  pastEdition?: { id: string; year: number; theme: string; venue_name: string; starts_on: string; ends_on: string } | null;
} = {}) {
  const activeMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const activeLimit = vi.fn(() => ({ maybeSingle: activeMaybeSingle }));
  const activeOrder = vi.fn(() => ({ limit: activeLimit }));
  const inMock = vi.fn(() => ({ order: activeOrder }));

  const pastMaybeSingle = vi.fn().mockResolvedValue({ data: pastEdition, error: null });
  const pastLimit = vi.fn(() => ({ maybeSingle: pastMaybeSingle }));
  const pastOrder = vi.fn(() => ({ limit: pastLimit }));
  const eqMock = vi.fn(() => ({ order: pastOrder }));

  createClientMock.mockResolvedValue({
    from: () => ({ select: () => ({ in: inMock, eq: eqMock }) }),
  });
}

describe("HomePage", () => {
  it("renders quick links to About and Schedule", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "Learn More" })).toHaveAttribute("href", "/en/about");
    expect(screen.getByRole("link", { name: "View Schedule" })).toHaveAttribute("href", "/en/schedule");
  });

  it("shows the registration-not-open copy when there is no active edition", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText(
        "Registration for the July 12–17, 2027 convention opens in October 2026 — pricing will be posted here as soon as it's confirmed."
      )
    ).toBeInTheDocument();
  });

  it("leads the hero with the registration-opens promo when registration isn't open", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("Registration Opens October 2026")).toBeInTheDocument();
  });

  it("renders a Just Concluded section for the most recent past edition", async () => {
    mockEditionQueries({
      pastEdition: {
        id: "e-2026",
        year: 2026,
        theme: "The Bible: God's Message to Man",
        venue_name: "CAC Village",
        starts_on: "2026-07-13",
        ends_on: "2026-07-18",
      },
    });

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("Just Concluded")).toBeInTheDocument();
    expect(
      screen.getByText("2026 — The Bible: God's Message to Man", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Photos" })).toHaveAttribute("href", "/en/gallery");
    expect(screen.getByRole("link", { name: "See Past Conventions" })).toHaveAttribute("href", "/en/archive");
  });

  it("omits the Just Concluded section when there is no past edition", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.queryByText("Just Concluded")).not.toBeInTheDocument();
  });

  it("renders the kicker and welcome message", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("July 12–17, 2027 · CAC Village, USA")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome to CACNA Convention" })).toBeInTheDocument();
    expect(screen.getByText(welcomeMessage.paragraphs[0])).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/en/contact");
  });

  it("renders a Gallery CTA linking to the gallery page", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "View Gallery" })).toHaveAttribute("href", "/en/gallery");
  });

  it("renders a News & Events CTA linking to the news page", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "See News & Events" })).toHaveAttribute("href", "/en/news");
  });

  it("renders the hero stat strip with real founding/leadership/committee counts", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText(String(history.foundingYear))).toBeInTheDocument();
    expect(screen.getByText("Founded")).toBeInTheDocument();
    expect(screen.getByText(String(leadership.length))).toBeInTheDocument();
    expect(screen.getByText("Regional Leaders")).toBeInTheDocument();
    expect(screen.getByText(String(committee.length))).toBeInTheDocument();
    expect(screen.getByText("Committee Members")).toBeInTheDocument();
  });

  it("breaks the daily rhythm into a 4-item grid", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Prayer & Worship" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ministers' Sessions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Break-Outs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Revival Nights" })).toBeInTheDocument();
  });
});
