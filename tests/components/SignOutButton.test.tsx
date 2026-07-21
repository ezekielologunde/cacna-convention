import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignOutButton } from "../../components/ui/SignOutButton";

// vi.mock() factories are hoisted above all other statements, including
// plain `const` declarations -- referencing a chain of consts (a mock
// client fn that itself closes over another mock fn) inside a hoisted
// factory hits a temporal-dead-zone error unless declared via vi.hoisted(),
// which Vitest special-cases to run before the hoisted mock calls.
const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const { siteSignOutMock, adminSignOutMock, createAttendeeClientMock, createClientMock } = vi.hoisted(() => {
  const siteSignOutMock = vi.fn().mockResolvedValue({ error: null });
  const adminSignOutMock = vi.fn().mockResolvedValue({ error: null });
  return {
    siteSignOutMock,
    adminSignOutMock,
    createAttendeeClientMock: vi.fn(() => ({ auth: { signOut: siteSignOutMock } })),
    createClientMock: vi.fn(() => ({ auth: { signOut: adminSignOutMock } })),
  };
});
vi.mock("@/lib/supabase/client", () => ({
  createClient: createClientMock,
  createAttendeeClient: createAttendeeClientMock,
}));

beforeEach(() => {
  pushMock.mockClear();
  refreshMock.mockClear();
  siteSignOutMock.mockClear();
  adminSignOutMock.mockClear();
  createAttendeeClientMock.mockClear();
  createClientMock.mockClear();
});

describe("SignOutButton", () => {
  it('signs out of the attendee (site) client and redirects for scope="site"', async () => {
    render(
      <SignOutButton scope="site" redirectTo="/en/account">
        Sign out
      </SignOutButton>
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(siteSignOutMock).toHaveBeenCalled());
    expect(adminSignOutMock).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/en/account");
    expect(refreshMock).toHaveBeenCalled();
  });

  it('signs out of the default (admin) client and redirects for scope="admin"', async () => {
    render(
      <SignOutButton scope="admin" redirectTo="/admin/login">
        Sign out
      </SignOutButton>
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(adminSignOutMock).toHaveBeenCalled());
    expect(siteSignOutMock).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/admin/login");
  });
});
