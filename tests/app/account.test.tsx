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

// `from`'s return type is intentionally loosened to `(table: string) => any`
// -- individual tests below override the default `makeFromMock()` with a
// plain per-table-branching function, which doesn't structurally match a
// `vi.fn()`'s inferred Mock type otherwise.
const createAttendeeClientMock = vi.fn(
  async (): Promise<{ auth: { getUser: typeof getUserMock }; from: (table: string) => any }> => ({
    auth: { getUser: getUserMock },
    from: makeFromMock(),
  })
);

// The Notifications card's subscription check queries
// newsletter_subscribers via the *service* client (see the account page's
// own comment on why -- that table has no attendee-facing RLS policy at
// all). Resolves "not subscribed" by default; individual tests override
// via createServiceClientMock.mockReturnValueOnce for the opposite case.
const createServiceClientMock = vi.fn(() => ({
  from: () => ({
    select: () => ({
      eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    }),
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAttendeeClient: createAttendeeClientMock,
  createServiceClient: createServiceClientMock,
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

  it("renders the Notifications card unsubscribed by default, and subscribes on click", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "person@example.com" } } });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ subscribed: true }) });
    vi.stubGlobal("fetch", fetchMock);

    const { default: AccountPage } = await import("../../app/(site)/[locale]/account/page");
    const Page = await AccountPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText(messages.Account.notificationsUnsubscribed)).toBeInTheDocument();
    const subscribeButton = screen.getByRole("button", { name: messages.Account.notificationsSubscribeCta });
    fireEvent.click(subscribeButton);

    expect(await screen.findByText(messages.Account.notificationsSubscribed)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/account/notifications", { method: "POST" });

    vi.unstubAllGlobals();
  });

  it("shows a check-in QR code only for paid registrations, not pending ones", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "person@example.com" } } });
    createAttendeeClientMock.mockImplementationOnce(async () => ({
      auth: { getUser: getUserMock },
      from: (table: string) => {
        if (table === "registrations") {
          return {
            select: () => ({
              eq: () => ({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { id: "paid-reg", church_name: "Paid Church", contact_name: "Paid Person", status: "paid", total_amount_cents: 5000, created_at: "" },
                    { id: "pending-reg", church_name: null, contact_name: "Pending Person", status: "pending", total_amount_cents: 5000, created_at: "" },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      },
    }));

    const { default: AccountPage } = await import("../../app/(site)/[locale]/account/page");
    const Page = await AccountPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    const qrCodes = screen.getAllByRole("img", { name: messages.Account.qrCodeLabel });
    expect(qrCodes).toHaveLength(1);
  });

  it("renders the Support card with existing tickets and a submission form", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "person@example.com" } } });
    createAttendeeClientMock.mockImplementationOnce(async () => ({
      auth: { getUser: getUserMock },
      from: (table: string) => {
        if (table === "support_tickets") {
          return {
            select: () => ({
              eq: () => ({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: "t1", subject: "Can't find my confirmation email", status: "open", created_at: "" }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      },
    }));

    const { default: AccountPage } = await import("../../app/(site)/[locale]/account/page");
    const Page = await AccountPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("Can't find my confirmation email")).toBeInTheDocument();
    expect(screen.getByText(messages.Account.ticketStatusOpen)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.Account.ticketSubjectLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.Account.ticketMessageLabel)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: messages.Account.ticketSubmitCta })
    ).toBeInTheDocument();
  });
});
