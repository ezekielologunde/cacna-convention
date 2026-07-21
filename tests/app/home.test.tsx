import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { registrationGuidelines } from "../../lib/content/registration-guidelines";
import { paymentOptions } from "../../lib/content/payment-options";
import { anniversary } from "../../lib/content/anniversary";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// The homepage IS the registration flow now (see app/(site)/[locale]/page.tsx's
// own header comment) -- this file replaces both the old homepage test
// (Welcome/Find Your Path/Programs/Timeline/Watch/News+Gallery/Marquee/Give,
// all removed or relocated to About -- see tests/components/AboutContent.test.tsx)
// and the substantive part of the old register page test (/register is now
// just a redirect -- see tests/app/register.test.tsx).
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

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

// Models an edition row existing (e.g. 2027, status "upcoming") but with no
// pricing_tiers rows yet. Two different query shapes against two tables:
// convention_editions gets getActiveEdition()'s .in().order().limit() chain
// plus the page's own .eq() detail lookup (theme/dates/venue); pricing_tiers
// gets both getActivePricingForEdition()'s .eq().lte().gte().order() chain
// and getPricingLadderForEdition()'s .eq().order().order() chain.
function mockActiveEditionWithoutPricing() {
  const editionMaybeSingle = vi.fn().mockResolvedValue({ data: { id: "e-2027", year: 2027 }, error: null });
  const editionLimit = vi.fn(() => ({ maybeSingle: editionMaybeSingle }));
  const editionOrder = vi.fn(() => ({ limit: editionLimit }));
  const editionIn = vi.fn(() => ({ order: editionOrder }));

  const editionDetailsMaybeSingle = vi.fn().mockResolvedValue({
    data: { theme: "The Bible: God's Message to Man", starts_on: "2027-07-12", ends_on: "2027-07-17", venue_name: "CAC Village" },
    error: null,
  });
  const editionDetailsEq = vi.fn(() => ({ maybeSingle: editionDetailsMaybeSingle }));

  const pricingOrder = vi.fn().mockResolvedValue({ data: [], error: null });
  const pricingGte = vi.fn(() => ({ order: pricingOrder }));
  const pricingLte = vi.fn(() => ({ gte: pricingGte }));
  const ladderOrder2 = vi.fn().mockResolvedValue({ data: [], error: null });
  const ladderOrder1 = vi.fn(() => ({ order: ladderOrder2 }));
  const pricingEq = vi.fn(() => ({ lte: pricingLte, order: ladderOrder1 }));

  createClientMock.mockResolvedValue({
    from: (table: string) => {
      if (table === "convention_editions") {
        return { select: () => ({ in: editionIn, eq: editionDetailsEq }) };
      }
      return { select: () => ({ eq: pricingEq }) };
    },
  });
}

describe("HomePage", () => {
  it("renders the register hero and guidelines/payment sections even when registration isn't open yet", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Registration Guidelines" })).toBeInTheDocument();
    expect(screen.getByText(registrationGuidelines.items[0])).toBeInTheDocument();
    expect(screen.getByText(registrationGuidelines.freeFoodNote)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Payment Options" })).toBeInTheDocument();
    for (const method of paymentOptions.methods) {
      expect(screen.getByText(method.name)).toBeInTheDocument();
      expect(screen.getByText(method.detail)).toBeInTheDocument();
    }
  });

  it("shows the not-open hero copy and CTA when an edition exists but has no pricing yet", async () => {
    mockActiveEditionWithoutPricing();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText(
        "Registration for July 12–17, 2027 opens in October 2026. Bookmark this page — pricing and the guidelines below will go live the moment it does."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get notified when it opens" })).toHaveAttribute(
      "href",
      "#registration-guidelines"
    );
    // No pricing ladder yet, so the fee section and the actual submission
    // form must both be absent.
    expect(screen.queryByRole("heading", { name: "Registration Fees" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Individual" })).not.toBeInTheDocument();
  });

  it("renders the hero heading naming the convention explicitly, with the year's theme", async () => {
    mockActiveEditionWithoutPricing();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Register for CACNA Convention 2027" })).toBeInTheDocument();
    expect(screen.getByText("July 12–17, 2027 · CAC Village")).toBeInTheDocument();
    expect(screen.getByText("“The Bible: God's Message to Man”")).toBeInTheDocument();
  });

  it("renders a fee card per category showing the whole price ladder, not just today's active rate", async () => {
    const editionMaybeSingle = vi.fn().mockResolvedValue({ data: { id: "e-2027", year: 2027 }, error: null });
    const editionLimit = vi.fn(() => ({ maybeSingle: editionMaybeSingle }));
    const editionOrder = vi.fn(() => ({ limit: editionLimit }));
    const editionIn = vi.fn(() => ({ order: editionOrder }));

    const editionDetailsMaybeSingle = vi.fn().mockResolvedValue({
      data: { theme: null, starts_on: "2027-07-12", ends_on: "2027-07-17", venue_name: "CAC Village" },
      error: null,
    });
    const editionDetailsEq = vi.fn(() => ({ maybeSingle: editionDetailsMaybeSingle }));

    // getActivePricingForEdition (today's active tier only) returns just the
    // first adult tier -- exercises the "current rate" badge.
    const activeTier = { id: "a1", category: "adult", price_cents: 12500, starts_on: "2026-10-01", ends_on: "2027-01-31", sort_order: 0 };
    const pricingOrder = vi.fn().mockResolvedValue({ data: [activeTier], error: null });
    const pricingGte = vi.fn(() => ({ order: pricingOrder }));
    const pricingLte = vi.fn(() => ({ gte: pricingGte }));

    // getPricingLadderForEdition (the full schedule).
    const ladderOrder2 = vi.fn().mockResolvedValue({
      data: [
        activeTier,
        { id: "a2", category: "adult", price_cents: 25000, starts_on: "2027-07-11", ends_on: "2027-07-17", sort_order: 3 },
        { id: "c1", category: "child", price_cents: 0, starts_on: "2026-10-01", ends_on: "2027-07-17", sort_order: 0 },
      ],
      error: null,
    });
    const ladderOrder1 = vi.fn(() => ({ order: ladderOrder2 }));
    const pricingEq = vi.fn(() => ({ lte: pricingLte, order: ladderOrder1 }));

    createClientMock.mockResolvedValue({
      from: (table: string) => {
        if (table === "convention_editions") {
          return { select: () => ({ in: editionIn, eq: editionDetailsEq }) };
        }
        return { select: () => ({ eq: pricingEq }) };
      },
    });

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Registration Fees" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Adult (30+)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Child (1–19)" })).toBeInTheDocument();
    expect(screen.getByText("$125")).toBeInTheDocument();
    expect(screen.getByText("Through Jan 31, 2027")).toBeInTheDocument();
    expect(screen.getByText("$250")).toBeInTheDocument();
    expect(screen.getByText("At the Convention Ground")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Current Rate")).toBeInTheDocument();
    // The urgency banner names the active adult rate directly in the hero.
    expect(
      screen.getByText("Adult rate is $125 through 2027-01-31 — register now before it goes up.")
    ).toBeInTheDocument();
  });

  it("keeps the 50th anniversary section prominent, right after the hero", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("50th Anniversary Celebration")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "50 years of CAC North America." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See the celebration/ })).toHaveAttribute(
      "href",
      anniversary.moreInfoUrl
    );
  });
});
