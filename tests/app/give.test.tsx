import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("GivePage", () => {
  it("renders instead of 404ing", async () => {
    const { default: GivePage } = await import("../../app/(site)/[locale]/give/page");
    const Page = await GivePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Give" })).toBeInTheDocument();
    expect(screen.getByText(messages.Give.comingSoon)).toBeInTheDocument();
  });
});
