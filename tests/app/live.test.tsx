import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("LivePage", () => {
  it("renders instead of 404ing", async () => {
    const { default: LivePage } = await import("../../app/(site)/[locale]/live/page");
    const Page = await LivePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Live" })).toBeInTheDocument();
    expect(screen.getByText(messages.Live.comingSoon)).toBeInTheDocument();
    // Regex, not a plain string: getByRole's `name` option ignores `exact`
    // for string matchers (always exact-equality) -- only RegExp/function
    // matchers do a partial match. The link's accessible name also includes
    // an "(opens in a new tab)" suffix via aria-label for screen readers.
    expect(
      screen.getByRole("link", { name: /^Watch on YouTube/ })
    ).toHaveAttribute("href", "https://youtube.com/@cacnorthamericalatunderegi1330");
  });
});
