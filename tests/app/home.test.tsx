import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { anniversary } from "../../lib/content/anniversary";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// A deliberately simple, static homepage (no Supabase data at all) --
// see tests/app/register.test.tsx for the actual registration flow, its
// own page again as of 2026-07-22.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

// Mirrors tests/app/register.test.tsx's own helpers -- the homepage now
// runs the same getActiveEdition()/getActivePricingForEdition() pair
// RegisterCta.tsx already used, to decide whether the hero shows a plain
// "Register Now" or the registration-not-open-yet note.
function mockNoActiveEdition() {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  createClientMock.mockResolvedValue({
    from: () => ({ select: () => ({ in: inMock }) }),
  });
}

function mockActiveEdition({ withPricing }: { withPricing: boolean }) {
  const editionMaybeSingle = vi.fn().mockResolvedValue({ data: { id: "e-2027", year: 2027 }, error: null });
  const editionLimit = vi.fn(() => ({ maybeSingle: editionMaybeSingle }));
  const editionOrder = vi.fn(() => ({ limit: editionLimit }));
  const editionIn = vi.fn(() => ({ order: editionOrder }));

  const pricingOrder = vi.fn().mockResolvedValue({
    data: withPricing ? [{ id: "t1", category: "adult", price_cents: 8000 }] : [],
    error: null,
  });
  const pricingGte = vi.fn(() => ({ order: pricingOrder }));
  const pricingLte = vi.fn(() => ({ gte: pricingGte }));
  const pricingEq = vi.fn(() => ({ lte: pricingLte }));

  createClientMock.mockResolvedValue({
    from: (table: string) =>
      table === "convention_editions"
        ? { select: () => ({ in: editionIn }) }
        : { select: () => ({ eq: pricingEq }) },
  });
}

describe("HomePage", () => {
  it("renders the welcome hero with Register and Schedule CTAs", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Welcome to CACNA Convention", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register Now" })).toHaveAttribute("href", "/en/register");
    expect(screen.getByRole("link", { name: "View Schedule" })).toHaveAttribute("href", "/en/schedule");
  });

  it("keeps the 50th anniversary section prominent, right after the hero", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("50th Anniversary Celebration")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "50 years of CAC North America." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See the celebration/ })).toHaveAttribute(
      "href",
      anniversary.moreInfoUrl
    );
  });

  it("renders a short mission teaser linking to About", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Why We Gather" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more about us" })).toHaveAttribute("href", "/en/about");
  });

  it("renders a quick-links grid to Register, Schedule, Store, and Give", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Get Involved" })).toBeInTheDocument();
    expect(document.querySelector('a[href="/en/register"]')).not.toBeNull();
    expect(document.querySelector('a[href="/en/schedule"]')).not.toBeNull();
    expect(document.querySelector('a[href="/en/store"]')).not.toBeNull();
    expect(document.querySelector('a[href="/en/give"]')).not.toBeNull();
  });

  it("shows a registration-opens-October-2026 note and coming-soon quick-link copy when there's no active edition", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText("Registration for Convention 2027 opens in October 2026.")
    ).toBeInTheDocument();
    expect(screen.getByText("Registration opens October 2026 — see what's ahead.")).toBeInTheDocument();
    expect(screen.queryByText("Secure your spot at this year's convention.")).not.toBeInTheDocument();
  });

  it("shows the same coming-soon note when an edition exists but has no pricing yet", async () => {
    mockActiveEdition({ withPricing: false });

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText("Registration for Convention 2027 opens in October 2026.")
    ).toBeInTheDocument();
  });

  it("hides the coming-soon note and shows the normal quick-link copy once registration is open", async () => {
    mockActiveEdition({ withPricing: true });

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.queryByText("Registration for Convention 2027 opens in October 2026.")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Secure your spot at this year's convention.")).toBeInTheDocument();
    expect(screen.queryByText("Registration opens October 2026 — see what's ahead.")).not.toBeInTheDocument();
  });
});
