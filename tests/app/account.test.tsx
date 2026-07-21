import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

const getUserMock = vi.fn();

// Supports the three queries AccountPage issues when signed in:
// attendee_profiles.select().eq().maybeSingle(), and
// registrations/store_orders.select().eq().order() — both resolve empty by
// default so the signed-out and empty-state tests don't need to know about
// this shape at all.
function makeFromMock() {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });
  const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock, order: orderMock }));
  return vi.fn(() => ({ select: () => ({ eq: eqMock }) }));
}

const createAttendeeClientMock = vi.fn(async () => ({
  auth: { getUser: getUserMock },
  from: makeFromMock(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createAttendeeClient: createAttendeeClientMock,
}));

// The signed-in branch renders SignOutButton, which calls next/navigation's
// useRouter() -- not mounted in this plain jsdom render, so it needs a mock
// (same reasoning as the usePathname mock in PrimaryNav.test.tsx).
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

beforeEach(() => {
  getUserMock.mockReset();
  getUserMock.mockResolvedValue({ data: { user: null } });
});

describe("AccountPage", () => {
  it("renders the Preferences card with a working theme toggle", async () => {
    const { default: AccountPage } = await import("../../app/(site)/[locale]/account/page");
    const Page = await AccountPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Account" })).toBeInTheDocument();
    expect(screen.getByText(messages.Account.preferencesHeading)).toBeInTheDocument();
    expect(screen.getByText(messages.Account.themeLabel)).toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Switch to dark mode" });
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("shows a sign-in prompt linking to the login page when signed out", async () => {
    const { default: AccountPage } = await import("../../app/(site)/[locale]/account/page");
    const Page = await AccountPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText(messages.Account.signInPrompt)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: messages.Account.signInCta })).toHaveAttribute(
      "href",
      "/en/account/login"
    );
    expect(screen.queryByText(messages.Account.signOutCta)).not.toBeInTheDocument();
  });

  it("shows the signed-in email and a sign-out button when authenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "person@example.com" } } });

    const { default: AccountPage } = await import("../../app/(site)/[locale]/account/page");
    const Page = await AccountPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("person@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: messages.Account.signOutCta })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: messages.Account.signInCta })).not.toBeInTheDocument();
  });
});
