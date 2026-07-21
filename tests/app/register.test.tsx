import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { registrationGuidelines } from "../../lib/content/registration-guidelines";
import { paymentOptions } from "../../lib/content/payment-options";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

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
// pricing_tiers rows yet -- the real state of the live database today
// (registration for 2027 opens in October 2026). Distinct queries against
// two different tables, branched by table name. convention_editions gets
// two different query shapes: getActiveEdition()'s .in().order().limit()
// chain, and the register page's own .eq() detail lookup (theme/dates/venue
// for the hero) -- both need to resolve off the same mocked table.
function mockActiveEditionWithoutPricing() {
  const editionMaybeSingle = vi.fn().mockResolvedValue({
    data: { id: "e-2027", year: 2027 },
    error: null,
  });
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
  const pricingEq = vi.fn(() => ({ lte: pricingLte }));

  createClientMock.mockResolvedValue({
    from: (table: string) => {
      if (table === "convention_editions") {
        return { select: () => ({ in: editionIn, eq: editionDetailsEq }) };
      }
      return { select: () => ({ eq: pricingEq }) };
    },
  });
}

describe("RegisterPage", () => {
  it("renders the Registration Guidelines even when registration isn't open yet", async () => {
    mockNoActiveEdition();

    const { default: RegisterPage } = await import("../../app/(site)/[locale]/register/page");
    const Page = await RegisterPage({ params: Promise.resolve({ locale: "en" }) });

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

  it("shows the not-open hero message when an edition exists but has no pricing yet", async () => {
    mockActiveEditionWithoutPricing();

    const { default: RegisterPage } = await import("../../app/(site)/[locale]/register/page");
    const Page = await RegisterPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText(
        "Registration for July 12–17, 2027 opens in October 2026. Bookmark this page — pricing and the guidelines below will go live the moment it does."
      )
    ).toBeInTheDocument();
    // The actual form (individual/group tabs) must not render -- an edition
    // row alone isn't enough to accept real submissions with no pricing.
    expect(screen.queryByRole("tab", { name: "Individual" })).not.toBeInTheDocument();
  });
});
