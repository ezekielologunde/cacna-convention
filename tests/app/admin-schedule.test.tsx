import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const EDITIONS = [
  { id: "e-2027", year: 2027, status: "upcoming", starts_on: "2027-07-12" },
  { id: "e-2026", year: 2026, status: "past", starts_on: "2026-07-13" },
  { id: "e-2030", year: 2030, status: "upcoming", starts_on: "2030-07-15" },
];

const SESSIONS_2027 = [
  {
    id: "s1",
    day_date: "2027-07-12",
    starts_at: "09:00:00",
    ends_at: "10:00:00",
    title: "Opening Session",
    minister_name: null,
    minister_title: null,
    track: "general",
    audience: ["all"],
    sort_order: 1,
  },
];

function makeSupabaseMock(sessions: typeof SESSIONS_2027) {
  return {
    from: (table: string) => {
      if (table === "convention_editions") {
        return { select: () => ({ order: vi.fn().mockResolvedValue({ data: EDITIONS, error: null }) }) };
      }
      if (table === "schedule_sessions") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({ order: vi.fn().mockResolvedValue({ data: sessions, error: null }) }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

const requireAdminMock = vi.fn();
vi.mock("@/lib/supabase/require-admin", () => ({
  requireAdmin: requireAdminMock,
}));

// Isolates this file to the page's own data-fetching/selection logic --
// ScheduleAdminView's own interactive behavior (clone/edit/delete) is
// covered separately in tests/components/ScheduleAdminView.test.tsx.
const scheduleAdminViewMock = vi.fn((_props: unknown) => <div data-testid="schedule-admin-view" />);
vi.mock("@/components/admin/ScheduleAdminView", () => ({
  ScheduleAdminView: (props: unknown) => scheduleAdminViewMock(props),
}));

describe("AdminSchedulePage", () => {
  it("defaults to the current/upcoming edition (earliest such year)", async () => {
    requireAdminMock.mockResolvedValue({ supabase: makeSupabaseMock(SESSIONS_2027), user: { email: "admin@example.com" } });
    const { default: AdminSchedulePage } = await import("../../app/(admin)/admin/schedule/page");

    const Page = await AdminSchedulePage({ searchParams: Promise.resolve({}) });
    render(Page);

    expect(screen.getByRole("link", { name: "2027" })).toHaveClass("bg-[var(--color-red-text)]");
    expect(scheduleAdminViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        editionId: "e-2027",
        editionStartsOn: "2027-07-12",
        initialSessions: SESSIONS_2027,
      })
    );
  });

  it("passes every other edition as a clone source, excluding the selected one", async () => {
    requireAdminMock.mockResolvedValue({ supabase: makeSupabaseMock(SESSIONS_2027), user: { email: "admin@example.com" } });
    const { default: AdminSchedulePage } = await import("../../app/(admin)/admin/schedule/page");

    const Page = await AdminSchedulePage({ searchParams: Promise.resolve({}) });
    render(Page);

    const call = scheduleAdminViewMock.mock.calls.at(-1)![0] as { otherEditions: { id: string }[] };
    expect(call.otherEditions.map((e) => e.id)).toEqual(["e-2026", "e-2030"]);
  });

  it("respects an explicit ?edition= query param", async () => {
    requireAdminMock.mockResolvedValue({ supabase: makeSupabaseMock([]), user: { email: "admin@example.com" } });
    const { default: AdminSchedulePage } = await import("../../app/(admin)/admin/schedule/page");

    const Page = await AdminSchedulePage({ searchParams: Promise.resolve({ edition: "e-2026" }) });
    render(Page);

    expect(screen.getByRole("link", { name: "2026" })).toHaveClass("bg-[var(--color-red-text)]");
  });
});
