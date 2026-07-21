import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { newsEvents, upcomingConventionDates } from "../../lib/content/news-events";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
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

// getCacWorldNews/getCacnorthBlogPosts/getCacnorthEvents hit a real,
// separate Supabase project (lib/cacnorth-supabase.ts) over the network --
// mocked per-test so the suite never depends on external network access,
// matching the no-live-calls-in-tests convention used everywhere else in
// this project.
const getCacWorldNewsMock = vi.fn().mockResolvedValue([]);
const getCacnorthBlogPostsMock = vi.fn().mockResolvedValue([]);
const getCacnorthEventsMock = vi.fn().mockResolvedValue([]);
vi.mock("@/lib/cacnorth-content", () => ({
  getCacWorldNews: () => getCacWorldNewsMock(),
  getCacnorthBlogPosts: () => getCacnorthBlogPostsMock(),
  getCacnorthEvents: () => getCacnorthEventsMock(),
}));

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

// See tests/app/register.test.tsx for why this shape mocks "no active
// edition" -- RegisterCta (now rendered at the bottom of this page) calls
// createClient()/getActiveEdition() unconditionally on every render.
function mockNoActiveEdition() {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  createClientMock.mockResolvedValue({
    from: () => ({ select: () => ({ in: inMock }) }),
  });
}

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

describe("NewsPage", () => {
  it("renders the 50th anniversary celebration", async () => {
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "News & Events" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: newsEvents[0].title })
    ).toBeInTheDocument();
    // `location` is optional on NewsEvent (some events, like the retreat
    // below, don't have one) -- this specific event does, so a non-null
    // assertion here is accurate rather than a type-check workaround. Now
    // shared verbatim with the Convention Chairman transition event below,
    // so assert at least one match rather than exactly one.
    expect(screen.getAllByText(newsEvents[0].location!).length).toBeGreaterThan(0);
    expect(screen.getByText("October 10, 2026")).toBeInTheDocument();
  });

  it("renders the 2027 Ministers Retreat with a date range, highlights, and a details link", async () => {
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    const retreat = newsEvents.find((event) => event.title === "2027 Ministers Retreat")!;
    expect(screen.getByRole("heading", { name: retreat.title })).toBeInTheDocument();
    expect(screen.getByText("March 22, 2027 – March 26, 2027")).toBeInTheDocument();

    for (const highlight of retreat.highlights!) {
      expect(screen.getByText(highlight)).toBeInTheDocument();
    }

    // Both news events now have a "See details" link (the 50th anniversary
    // entry also links out, to cacnorthamerica.com's homepage), so find the
    // one whose href matches this specific event's URL rather than
    // asserting there's exactly one such link on the page.
    const detailLinks = screen.getAllByRole("link", { name: /^See details/ });
    expect(detailLinks.some((link) => link.getAttribute("href") === retreat.moreInfoUrl)).toBe(true);
  });

  it("renders the Convention Chairman transition announcement", async () => {
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    const transition = newsEvents.find((event) => event.title === "Convention Chairman Concludes Two-Decade Tenure")!;
    expect(screen.getByRole("heading", { name: transition.title })).toBeInTheDocument();
    expect(screen.getByText(transition.description)).toBeInTheDocument();
  });

  it("renders the Save the Date table of upcoming convention years", async () => {
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Save the Date" })).toBeInTheDocument();
    for (const entry of upcomingConventionDates) {
      expect(screen.getByText(String(entry.year))).toBeInTheDocument();
      expect(screen.getByText(entry.dateRange)).toBeInTheDocument();
    }
  });

  it("does not render the CAC World or CACNA Blog sections when there's no data", async () => {
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.queryByRole("heading", { name: "From CAC World" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "From the CACNA Blog" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "More Events from cacnorthamerica.com" })
    ).not.toBeInTheDocument();
  });

  it("renders cacnorthamerica.com events once the events table has rows", async () => {
    getCacnorthEventsMock.mockResolvedValueOnce([
      {
        id: "1",
        title: "CACNA 2027 Annual Convention",
        description: "Six days of worship and the Word.",
        eventDate: "2027-07-12T00:00:00.000Z",
        endDate: "2027-07-17T00:00:00.000Z",
        location: "CAC Village, Blue Ridge Summit, PA",
        eventUrl: "https://cacnorthamerica.com/events/cacna-2027",
      },
    ]);
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByRole("heading", { name: "More Events from cacnorthamerica.com" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "CACNA 2027 Annual Convention" })).toBeInTheDocument();
    expect(screen.getByText("July 12, 2027 – July 17, 2027")).toBeInTheDocument();
    expect(screen.getByText("CAC Village, Blue Ridge Summit, PA")).toBeInTheDocument();
    const detailLinks = screen.getAllByRole("link", { name: /^See details/ });
    expect(
      detailLinks.some((link) => link.getAttribute("href") === "https://cacnorthamerica.com/events/cacna-2027")
    ).toBe(true);
  });

  it("renders CAC World News items linking out to their real source", async () => {
    getCacWorldNewsMock.mockResolvedValueOnce([
      {
        id: "1",
        title: "CAC Mokola DCC charges church workers",
        excerpt: "A call to uphold biblical standards.",
        sourceUrl: "https://www.cacworldnews.com/2026/07/example.html",
        imageUrl: null,
        publishedAt: "2026-07-17T18:15:25.492Z",
      },
    ]);
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "From CAC World" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /CAC Mokola DCC charges church workers/ });
    expect(link).toHaveAttribute("href", "https://www.cacworldnews.com/2026/07/example.html");
    expect(screen.getByText("A call to uphold biblical standards.")).toBeInTheDocument();
  });

  it("renders CACNA Blog posts linking to cacnorthamerica.com once blog_posts has rows", async () => {
    getCacnorthBlogPostsMock.mockResolvedValueOnce([
      {
        id: "1",
        title: "A real blog post",
        slug: "a-real-blog-post",
        excerpt: "An excerpt.",
        imageUrl: null,
        publishedAt: "2026-07-01T00:00:00.000Z",
      },
    ]);
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "From the CACNA Blog" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /A real blog post/ });
    expect(link).toHaveAttribute("href", "https://cacnorthamerica.com/blog/a-real-blog-post");
  });

  it("renders the RegisterCta band since registration isn't open yet", async () => {
    mockNoActiveEdition();

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await resolveRegisterCta(await NewsPage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

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
});
