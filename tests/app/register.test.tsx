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
});
