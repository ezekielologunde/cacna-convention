import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { registrationGuidelines } from "../../lib/content/registration-guidelines";
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
// two different tables, branched by table name.
function mockActiveEditionWithoutPricing() {
  const editionMaybeSingle = vi.fn().mockResolvedValue({
    data: { id: "e-2027", year: 2027 },
    error: null,
  });
  const editionLimit = vi.fn(() => ({ maybeSingle: editionMaybeSingle }));
  const editionOrder = vi.fn(() => ({ limit: editionLimit }));
  const editionIn = vi.fn(() => ({ order: editionOrder }));

  const pricingOrder = vi.fn().mockResolvedValue({ data: [], error: null });
  const pricingGte = vi.fn(() => ({ order: pricingOrder }));
  const pricingLte = vi.fn(() => ({ gte: pricingGte }));
  const pricingEq = vi.fn(() => ({ lte: pricingLte }));

  createClientMock.mockResolvedValue({
    from: (table: string) => {
      if (table === "convention_editions") {
        return { select: () => ({ in: editionIn }) };
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
  });

  it("shows the not-open message when an edition exists but has no pricing yet", async () => {
    mockActiveEditionWithoutPricing();

    const { default: RegisterPage } = await import("../../app/(site)/[locale]/register/page");
    const Page = await RegisterPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText("Registration for the July 12–17, 2027 convention opens in October 2026 — check back then.")
    ).toBeInTheDocument();
    // The actual form (individual/group tabs) must not render -- an edition
    // row alone isn't enough to accept real submissions with no pricing.
    expect(screen.queryByRole("tab", { name: "Individual" })).not.toBeInTheDocument();
  });
});
