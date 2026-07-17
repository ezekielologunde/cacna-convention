import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

const getScheduleForEditionMock = vi.fn();
vi.mock("@/lib/schedule", () => ({
  getScheduleForEdition: getScheduleForEditionMock,
}));

// `next-intl/server`'s real (react-server) implementation of
// `getTranslations`/`setRequestLocale` needs an actual Next.js RSC request
// context (it reaches for `next/headers` under the hood). Outside of that —
// e.g. here, where the test imports the page module directly and calls it
// as a plain function — package resolution falls back to next-intl's
// non-RSC stub build, which throws `"... is not supported in Client
// Components."` for every export. That's a Vitest/Node module-resolution
// limitation, not a bug in the page: Next.js itself resolves the real
// react-server build at build/runtime. Mock the module here so the page's
// translation calls resolve against the real `en.json` copy instead of the
// stub. (Same pattern established in tests/app/plan-your-visit.test.tsx,
// tests/app/archive.test.tsx.)
vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async (namespace: string) => {
    const strings = (messages as Record<string, Record<string, string>>)[namespace];
    return (key: string, values?: Record<string, string | number>) => {
      let value = strings[key];
      if (values) {
        for (const [placeholder, replacement] of Object.entries(values)) {
          value = value.replace(`{${placeholder}}`, String(replacement));
        }
      }
      return value;
    };
  },
}));

// Mocks the `convention_editions` query chain the page runs (via
// `getActiveEdition`) before ever touching `getScheduleForEdition`:
//   .from("convention_editions").select("id, year").in("status", [...])
//     .order("year", ...).limit(1).maybeSingle()
// `select()` and `order()` don't assert on their arguments below, so this
// mock shape works regardless of the exact select list `getActiveEdition`
// requests; only the `id` field the page actually reads is included here.
function mockEditionQuery(resolvedValue: {
  data: { id: string } | null;
  error: null;
}) {
  const maybeSingleMock = vi.fn().mockResolvedValue(resolvedValue);
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  createClientMock.mockResolvedValue({
    from: () => ({ select: () => ({ in: inMock }) }),
  });
  return { inMock, orderMock, limitMock, maybeSingleMock };
}

describe("SchedulePage", () => {
  beforeEach(() => {
    getScheduleForEditionMock.mockReset();
  });

  it("shows the no-edition message and never fetches sessions when there is no current/upcoming edition", async () => {
    const { inMock } = mockEditionQuery({ data: null, error: null });

    const { default: SchedulePage } = await import(
      "../../app/(site)/[locale]/schedule/page"
    );
    const Page = await SchedulePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText("Schedule details will be posted closer to the convention.")
    ).toBeInTheDocument();
    expect(getScheduleForEditionMock).not.toHaveBeenCalled();

    // Guards against a regression that silently flips the status filter
    // (e.g. ["current", "upcoming"] -> ["past"]), which canned mock data
    // would not otherwise catch.
    expect(inMock).toHaveBeenCalledWith("status", ["current", "upcoming"]);
  });

  it("groups sessions under day headings in chronological order, not the order sessions arrive in", async () => {
    mockEditionQuery({ data: { id: "edition-1" }, error: null });

    // Deliberately returned out of day order (July 15th before July 13th)
    // to prove the page's `byDay` grouping renders days chronologically
    // rather than in whatever order `getScheduleForEdition` happens to
    // return sessions in.
    getScheduleForEditionMock.mockResolvedValue([
      {
        id: "s-15",
        edition_id: "edition-1",
        day_date: "2026-07-15",
        starts_at: "09:00:00",
        ends_at: "10:00:00",
        title: "Closing Session",
        minister_name: null,
        minister_title: null,
        track: "main",
        sort_order: 1,
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "s-13",
        edition_id: "edition-1",
        day_date: "2026-07-13",
        starts_at: "09:00:00",
        ends_at: "10:00:00",
        title: "Opening Session",
        minister_name: null,
        minister_title: null,
        track: "main",
        sort_order: 1,
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);

    const { default: SchedulePage } = await import(
      "../../app/(site)/[locale]/schedule/page"
    );
    const Page = await SchedulePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(["2026-07-13", "2026-07-15"]);

    expect(screen.getByText("Opening Session")).toBeInTheDocument();
    expect(screen.getByText("Closing Session")).toBeInTheDocument();
    expect(getScheduleForEditionMock).toHaveBeenCalledWith(
      expect.anything(),
      "edition-1"
    );
  });
});
