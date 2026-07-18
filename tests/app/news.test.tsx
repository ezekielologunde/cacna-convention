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
    expect(screen.getByText(newsEvents[0].location)).toBeInTheDocument();
    expect(screen.getByText("October 10, 2026")).toBeInTheDocument();
  });
});
