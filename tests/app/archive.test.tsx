import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { recurringSpeakerNote } from "../../lib/content/archive";

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

// `RegisterCta` is itself an async Server Component nested in this page's
// returned JSX (`<RegisterCta locale={locale} />`), which Next's real RSC
// renderer resolves automatically at request time. `@testing-library/react`
// renders with the client reconciler instead, which throws "<RegisterCta> is
// an async Client Component" the moment it reaches an unresolved async
// function component -- confirmed by actually running this suite without
// this shim first. This walks the page's top-level Fragment children, swaps
// the RegisterCta element for its already-awaited output, and leaves
// everything else untouched.
async function resolveRegisterCta(page: React.ReactElement): Promise<React.ReactElement> {
  // Dynamically imported (rather than a static top-level import) so this
  // module -- and its own static `@/lib/supabase/server` import -- only
  // loads after `createClientMock` above has actually been initialized; a
  // static import here would get hoisted ahead of that `const` and throw
  // "Cannot access 'createClientMock' before initialization" the moment the
  // mock factory below runs. Matches the same specifier the page module
  // itself imports, so Vitest's module cache hands back the identical
  // reference used for the `child.type === RegisterCta` check below.
  const { RegisterCta } = await import("../../components/register/RegisterCta");
  const children = React.Children.toArray((page.props as { children?: React.ReactNode }).children);
  const resolved = await Promise.all(
    children.map((child) =>
      React.isValidElement(child) && child.type === RegisterCta
        ? (RegisterCta as unknown as (props: unknown) => Promise<React.ReactElement>)(child.props)
        : child
    )
  );
  return React.cloneElement(page, undefined, ...resolved);
}

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
vi.mock("next-intl/server", () => {
  const mock = createNextIntlServerMock(messages);
  // RegisterCta calls `getTranslations({ locale, namespace })` (the object
  // form) while every other call site on this page uses the bare-string
  // form `getTranslations("Namespace")`. `createNextIntlServerMock` only
  // understands the string form -- confirmed by actually running this suite
  // first, which threw "namespace.split is not a function" once
  // RegisterCta's call reached it. Normalize both shapes to a namespace
  // string here rather than touching the shared helper.
  return {
    ...mock,
    getTranslations: (arg: string | { namespace: string }) =>
      mock.getTranslations(typeof arg === "string" ? arg : arg.namespace),
  };
});

describe("ArchivePage", () => {
  it("lists past editions with their theme and year", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ id: "e1", year: 2026, theme: "The Bible: God's Message to Man", starts_on: "2026-07-13", ends_on: "2026-07-18" }],
      error: null,
    });
    const eqMock = vi.fn(() => ({ order: orderMock }));

    // RegisterCta (now rendered at the bottom of this page) creates its own
    // Supabase client and calls getActiveEdition(), which chains
    // `.select().in("status", [...])` -- a different chain shape than this
    // page's own `.select().eq("status", "past")` query above. Both need to
    // hang off the same `select()` return value since `createClientMock`
    // only supports a single resolved client. See
    // tests/app/home.test.tsx's `mockEditionQueries` for the same pattern.
    const activeMaybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const activeLimitMock = vi.fn(() => ({ maybeSingle: activeMaybeSingleMock }));
    const activeOrderMock = vi.fn(() => ({ limit: activeLimitMock }));
    const inMock = vi.fn(() => ({ order: activeOrderMock }));

    // The page's own pricing_tiers lookup is a separate `.from("pricing_tiers")`
    // call that chains `.select().in("edition_id", [...])` straight to a
    // resolved value (no further chaining), unlike RegisterCta's
    // `.in("status", [...])` above -- discriminated by table name here so
    // both resolve correctly. Resolves empty so this test's single edition
    // renders without a fee block; fee-rendering itself is covered by the
    // second test below.
    const tiersInMock = vi.fn().mockResolvedValue({ data: [], error: null });

    createClientMock.mockResolvedValue({
      from: (table: string) =>
        table === "pricing_tiers"
          ? { select: () => ({ in: tiersInMock }) }
          : { select: () => ({ eq: eqMock, in: inMock }) },
    });

    const { default: ArchivePage } = await import("../../app/(site)/[locale]/archive/page");
    const Page = await resolveRegisterCta(await ArchivePage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText(recurringSpeakerNote)).toBeInTheDocument();

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

    // Guards against a regression that silently flips the status filter
    // (e.g. "past" -> "current"), which the canned mock data above would
    // not otherwise catch since it resolves regardless of what `.eq()` was
    // called with.
    expect(eqMock).toHaveBeenCalledWith("status", "past");

    // RegisterCta's own edition query resolves to null via `inMock` above
    // (no active edition), so it renders its "not open yet" band.
    expect(screen.getByRole("heading", { name: "Join Us at the 2027 Convention" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Registration for the July 12–17, 2027 convention opens in October 2026 — pricing will be posted as soon as it's confirmed."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get notified — view registration" })).toHaveAttribute(
      "href",
      "/en"
    );
  });

  it("shows a fee summary for editions with pricing_tiers data", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ id: "e1", year: 2026, theme: "The Bible: God's Message to Man", starts_on: "2026-07-13", ends_on: "2026-07-18" }],
      error: null,
    });
    const eqMock = vi.fn(() => ({ order: orderMock }));

    const activeMaybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const activeLimitMock = vi.fn(() => ({ maybeSingle: activeMaybeSingleMock }));
    const activeOrderMock = vi.fn(() => ({ limit: activeLimitMock }));
    const inMock = vi.fn(() => ({ order: activeOrderMock }));

    // Mirrors the real 2026 tiers seeded in
    // supabase/migrations/0008_seed_pricing_tiers_2026.sql: adult
    // $125-$250, young_adult $100-$150, child free throughout.
    const tiersInMock = vi.fn().mockResolvedValue({
      data: [
        { edition_id: "e1", category: "adult", price_cents: 12500 },
        { edition_id: "e1", category: "adult", price_cents: 25000 },
        { edition_id: "e1", category: "young_adult", price_cents: 10000 },
        { edition_id: "e1", category: "young_adult", price_cents: 15000 },
        { edition_id: "e1", category: "child", price_cents: 0 },
      ],
      error: null,
    });

    createClientMock.mockResolvedValue({
      from: (table: string) =>
        table === "pricing_tiers"
          ? { select: () => ({ in: tiersInMock }) }
          : { select: () => ({ eq: eqMock, in: inMock }) },
    });

    const { default: ArchivePage } = await import("../../app/(site)/[locale]/archive/page");
    const Page = await resolveRegisterCta(await ArchivePage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("What it cost")).toBeInTheDocument();
    expect(screen.getByText("$125–$250")).toBeInTheDocument();
    expect(screen.getByText("$100–$150")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
  });
});
