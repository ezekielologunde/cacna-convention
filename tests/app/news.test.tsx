import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { newsEvents } from "../../lib/content/news-events";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

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
});
