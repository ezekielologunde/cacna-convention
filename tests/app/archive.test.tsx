import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
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
// stub. (Same pattern established in tests/app/plan-your-visit.test.tsx.)
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

describe("ArchivePage", () => {
  it("lists past editions with their theme and year", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ id: "e1", year: 2026, theme: "The Bible: God's Message to Man", starts_on: "2026-07-13", ends_on: "2026-07-18" }],
      error: null,
    });
    const eqMock = vi.fn(() => ({ order: orderMock }));
    createClientMock.mockResolvedValue({
      from: () => ({ select: () => ({ eq: eqMock }) }),
    });

    const { default: ArchivePage } = await import("../../app/(site)/[locale]/archive/page");
    const Page = await ArchivePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    // The seeded edition's `starts_on`/`ends_on` ("2026-07-13"/"2026-07-18")
    // both contain the year "2026" as a substring, same as the heading's own
    // "{year} — {theme}" text. A page-wide `getByText("2026", { exact: false
    // })` therefore matches two elements (the edition heading AND the date
    // range paragraph) and throws "multiple elements found" — confirmed by
    // actually running this test before adding the `selector: "h2"` scope
    // below. No amount of wrapping year/theme in extra <span>s changes this:
    // the date-range paragraph independently contains "2026" regardless of
    // how the heading is structured, so the ambiguity is about real content
    // overlap, not markup granularity (unlike the ScheduleDay issue fixed in
    // Task 5). Scoping the query to the `h2` that renders the edition's
    // year/theme resolves the ambiguity without changing the page markup.
    expect(
      screen.getByText("2026", { exact: false, selector: "h2" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("The Bible: God's Message to Man", {
        exact: false,
        selector: "h2",
      })
    ).toBeInTheDocument();
  });
});
