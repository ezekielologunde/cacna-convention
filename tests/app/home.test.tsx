import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { welcomeMessage } from "../../lib/content/welcome";
import { history } from "../../lib/content/history";
import { leadership } from "../../lib/content/leadership";
import { committee } from "../../lib/content/committee";
import { mainGalleryPhotos } from "../../lib/content/gallery";

// `next-intl/server`'s real (react-server) implementation of
// `getTranslations`/`setRequestLocale` needs an actual Next.js RSC request
// context (it reaches for `next/headers` under the hood). Outside of that —
// e.g. here, where the test imports the page module directly and calls it
// as a plain function — package resolution falls back to next-intl's
// non-RSC stub build, which throws `"... is not supported in Client
// Components."` for every export. Confirmed by actually running this test
// without the mock first (threw exactly that error from `setRequestLocale`
// in app/(site)/[locale]/page.tsx). That's a Vitest/Node module-resolution
// limitation, not a bug in the page: Next.js itself resolves the real
// react-server build at build/runtime. Mock the module here so the page's
// translation calls resolve against the real `en.json` copy instead of the
// stub. (Same pattern established in tests/app/plan-your-visit.test.tsx,
// tests/app/archive.test.tsx, tests/app/contact.test.tsx.)
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

// The homepage calls both `getActiveEdition` (`.in("status", [...])`) and
// `getMostRecentPastEdition` (`.eq("status", "past")`) against the same
// `convention_editions` table, so `.select()` needs to return an object
// with both `.in` and `.eq` defined -- one mocked chain per query shape.
const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

// WatchSection fetches real videos via lib/videos.ts's RSS call -- mock it
// so the test suite doesn't make a real network request every run.
vi.mock("@/lib/videos", () => ({
  getRecentVideos: vi.fn().mockResolvedValue([
    { id: "abc123", title: "Sunday Service", published: "2026-01-01T00:00:00Z" },
  ]),
}));

function mockEditionQueries({
  pastEdition = null,
}: {
  pastEdition?: { id: string; year: number; theme: string; venue_name: string; starts_on: string; ends_on: string } | null;
} = {}) {
  const activeMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const activeLimit = vi.fn(() => ({ maybeSingle: activeMaybeSingle }));
  const activeOrder = vi.fn(() => ({ limit: activeLimit }));
  const inMock = vi.fn(() => ({ order: activeOrder }));

  const pastMaybeSingle = vi.fn().mockResolvedValue({ data: pastEdition, error: null });
  const pastLimit = vi.fn(() => ({ maybeSingle: pastMaybeSingle }));
  const pastOrder = vi.fn(() => ({ limit: pastLimit }));
  const eqMock = vi.fn(() => ({ order: pastOrder }));

  createClientMock.mockResolvedValue({
    from: () => ({ select: () => ({ in: inMock, eq: eqMock }) }),
  });
}

describe("HomePage", () => {
  it("renders quick links to About and Schedule", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "Learn More" })).toHaveAttribute("href", "/en/about");
    expect(screen.getByRole("link", { name: "View Schedule" })).toHaveAttribute("href", "/en/schedule");
  });

  it("shows the registration-not-open copy when there is no active edition", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText(
        "Registration for the July 12–17, 2027 convention opens in October 2026 — pricing will be posted here as soon as it's confirmed."
      )
    ).toBeInTheDocument();
  });

  it("leads the hero with the registration-opens promo when registration isn't open", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("Registration Opens October 2026")).toBeInTheDocument();
  });

  it("renders a Just Concluded section for the most recent past edition", async () => {
    mockEditionQueries({
      pastEdition: {
        id: "e-2026",
        year: 2026,
        theme: "The Bible: God's Message to Man",
        venue_name: "CAC Village",
        starts_on: "2026-07-13",
        ends_on: "2026-07-18",
      },
    });

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("Just Concluded")).toBeInTheDocument();
    expect(
      screen.getByText("2026 — The Bible: God's Message to Man", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Photos" })).toHaveAttribute("href", "/en/gallery");
    expect(screen.getByRole("link", { name: "See Past Conventions" })).toHaveAttribute("href", "/en/archive");
  });

  it("omits the Just Concluded section when there is no past edition", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.queryByText("Just Concluded")).not.toBeInTheDocument();
  });

  it("renders the kicker and welcome message", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("July 12–17, 2027 · CAC Village, USA")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome to CACNA Convention" })).toBeInTheDocument();
    expect(screen.getByText(welcomeMessage.paragraphs[0])).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/en/contact");
  });

  it("renders a Gallery CTA linking to the gallery page", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "View Gallery" })).toHaveAttribute("href", "/en/gallery");
  });

  it("renders a News & Events CTA linking to the news page", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "See News & Events" })).toHaveAttribute("href", "/en/news");
  });

  it("renders the hero stat strip with real founding/leadership/committee counts", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    // CountUp animates its number over ~1.2s via requestAnimationFrame even
    // once the (stubbed) IntersectionObserver fires immediately -- findByText's
    // default 1s timeout isn't quite enough to outlast that, so it's raised
    // here rather than asserting on a mid-animation value. Three sequential
    // findByText calls can each take up to that long, so the test's own
    // timeout (last arg below) is raised to comfortably outlast all three.
    const findOpts = { timeout: 3000 };
    expect(await screen.findByText(String(history.foundingYear), {}, findOpts)).toBeInTheDocument();
    expect(screen.getByText("Founded")).toBeInTheDocument();
    expect(await screen.findByText(String(leadership.length), {}, findOpts)).toBeInTheDocument();
    expect(screen.getByText("Regional Leaders")).toBeInTheDocument();
    expect(await screen.findByText(String(committee.length), {}, findOpts)).toBeInTheDocument();
    expect(screen.getByText("Committee Members")).toBeInTheDocument();
  }, 12000);

  it("breaks the daily rhythm into a 4-item grid", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Prayer & Worship" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ministers' Sessions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Break-Outs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Revival Nights" })).toBeInTheDocument();
  });

  it("shows the Convention Timeline heading with genuinely future-dated items only, excluding a past-tense announcement", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "The Convention Timeline" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "CAC North America 50th Anniversary Celebration" })).toBeInTheDocument();
    // The Chairman-transition item is a past-tense announcement tied to the
    // already-concluded 2026 convention, not a real upcoming program -- it
    // must not appear in this "what's next" section (it still surfaces on
    // /news, tested separately there).
    expect(
      screen.queryByRole("heading", { name: "Convention Chairman Concludes Two-Decade Tenure" })
    ).not.toBeInTheDocument();
  });

  it("renders a real 3-photo strip on the Gallery teaser card", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    const previewPhotos = mainGalleryPhotos.slice(0, 3);
    for (const src of previewPhotos) {
      const img = document.querySelector(`img[src*="${encodeURIComponent(src)}"]`);
      expect(img).not.toBeNull();
    }
  });

  it("makes Give the primary CTA and Registration secondary while registration isn't open", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    // "Give" also appears as a plain text link inside the Find Your Path
    // section's Returning Member card -- the actual closing-band CTA is the
    // last "Give" link on the page (Find Your Path renders well above the
    // closing Registration + Give band).
    const giveLinks = screen.getAllByRole("link", { name: "Give" });
    const giveLink = giveLinks[giveLinks.length - 1];
    const registerLink = screen.getByRole("link", { name: "Get notified — view registration" });
    // Primary/secondary variants carry a themed glow-shadow class; outline
    // carries a plain border class instead -- distinct enough to assert on
    // without depending on exact Tailwind color tokens.
    expect(giveLink.className).toContain("shadow-[var(--shadow-glow-red)]");
    expect(registerLink.className).toContain("border border-[var(--color-border)]");
  });

  it("renders the Find Your Path persona section with links for each persona", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Find your path." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "First-Time Attendee" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Returning Member" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Group or Church Leader" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Minister or Guest Speaker" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Register now" })[0]).toHaveAttribute("href", "/en/register");
  });

  it("renders the Find Your Program grid linking to all 7 sub-conference pages", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Find your program." })).toBeInTheDocument();
    const programHrefs = [
      "/en/youth",
      "/en/children",
      "/en/good-women",
      "/en/ministers-wives",
      "/en/cacma",
      "/en/christian-education",
      "/en/business-group",
    ];
    for (const href of programHrefs) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it("renders the Next Steps grid linking to register, plan-your-visit, give, and schedule", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("Full Schedule")).toBeInTheDocument();
    expect(document.querySelector('a[href="/en/plan-your-visit"]')).not.toBeNull();
    expect(document.querySelector('a[href="/en/schedule"]')).not.toBeNull();
  });

  it("upgrades the hero established badge to reference the 50th anniversary", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("Celebrating 50 Years · Est. 1976")).toBeInTheDocument();
  });

  it("renders the AnniversarySection with its heading and an external CTA to the celebration page", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("50th Anniversary Celebration")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "50 years of CAC North America." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See the celebration/ })).toHaveAttribute(
      "href",
      "https://cacnorthamerica.com/events/cacna-50th-anniversary-2026"
    );
  });
});
