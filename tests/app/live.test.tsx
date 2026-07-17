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
  });
});
