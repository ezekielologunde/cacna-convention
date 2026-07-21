import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { newsEvents } from "../../lib/content/news-events";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

// getCacWorldNews/getCacnorthBlogPosts hit a real, separate Supabase
// project (lib/cacnorth-supabase.ts) over the network -- mocked per-test so
// the suite never depends on external network access, matching the
// no-live-calls-in-tests convention used everywhere else in this project.
const getCacWorldNewsMock = vi.fn().mockResolvedValue([]);
const getCacnorthBlogPostsMock = vi.fn().mockResolvedValue([]);
vi.mock("@/lib/cacnorth-content", () => ({
  getCacWorldNews: () => getCacWorldNewsMock(),
  getCacnorthBlogPosts: () => getCacnorthBlogPostsMock(),
}));

describe("NewsPage", () => {
  it("renders the 50th anniversary celebration", async () => {
    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await NewsPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "News & Events" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: newsEvents[0].title })
    ).toBeInTheDocument();
    // `location` is optional on NewsEvent (some events, like the retreat
    // below, don't have one) -- this specific event does, so a non-null
    // assertion here is accurate rather than a type-check workaround.
    expect(screen.getByText(newsEvents[0].location!)).toBeInTheDocument();
    expect(screen.getByText("October 10, 2026")).toBeInTheDocument();
  });

  it("renders the 2027 Ministers Retreat with a date range, highlights, and a details link", async () => {
    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await NewsPage({ params: Promise.resolve({ locale: "en" }) });

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

  it("does not render the CAC World or CACNA Blog sections when there's no data", async () => {
    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await NewsPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.queryByRole("heading", { name: "From CAC World" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "From the CACNA Blog" })).not.toBeInTheDocument();
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

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await NewsPage({ params: Promise.resolve({ locale: "en" }) });

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

    const { default: NewsPage } = await import("../../app/(site)/[locale]/news/page");
    const Page = await NewsPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "From the CACNA Blog" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /A real blog post/ });
    expect(link).toHaveAttribute("href", "https://cacnorthamerica.com/blog/a-real-blog-post");
  });
});
