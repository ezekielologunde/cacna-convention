import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("GivePage", () => {
  it("renders the hero and the CAC Village Pay Off campaign with real account details", async () => {
    const { default: GivePage } = await import("../../app/(site)/[locale]/give/page");
    const Page = await GivePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Give", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(messages.Give.intro)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: messages.Give.villageHeading })).toBeInTheDocument();
    expect(screen.getByText(messages.Give.villageBody)).toBeInTheDocument();
    expect(screen.getByText(messages.Give.chaseValue)).toBeInTheDocument();
    expect(screen.getByText(messages.Give.zelleValue)).toBeInTheDocument();
  });

  it("links out to cacnorthamerica.com for CACNA's other giving campaigns", async () => {
    const { default: GivePage } = await import("../../app/(site)/[locale]/give/page");
    const Page = await GivePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByRole("link", { name: new RegExp(`^${messages.Give.moreWaysCta}`) })
    ).toHaveAttribute("href", "https://cacnorthamerica.com/giving");
  });

  it("ties giving to registration with a CTA to /register", async () => {
    const { default: GivePage } = await import("../../app/(site)/[locale]/give/page");
    const Page = await GivePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: messages.Give.registerTieHeading })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: messages.Give.registerTieCta })).toHaveAttribute(
      "href",
      "/en"
    );
  });
});
