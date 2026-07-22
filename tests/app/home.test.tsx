import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { anniversary } from "../../lib/content/anniversary";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// A deliberately simple, static homepage (no Supabase data at all) --
// see tests/app/register.test.tsx for the actual registration flow, its
// own page again as of 2026-07-22.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("HomePage", () => {
  it("renders the welcome hero with Register and Schedule CTAs", async () => {
    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Welcome to CACNA Convention", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register Now" })).toHaveAttribute("href", "/en/register");
    expect(screen.getByRole("link", { name: "View Schedule" })).toHaveAttribute("href", "/en/schedule");
  });

  it("keeps the 50th anniversary section prominent, right after the hero", async () => {
    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("50th Anniversary Celebration")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "50 years of CAC North America." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See the celebration/ })).toHaveAttribute(
      "href",
      anniversary.moreInfoUrl
    );
  });

  it("renders a short mission teaser linking to About", async () => {
    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Why We Gather" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more about us" })).toHaveAttribute("href", "/en/about");
  });

  it("renders a quick-links grid to Register, Schedule, Store, and Give", async () => {
    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Get Involved" })).toBeInTheDocument();
    expect(document.querySelector('a[href="/en/register"]')).not.toBeNull();
    expect(document.querySelector('a[href="/en/schedule"]')).not.toBeNull();
    expect(document.querySelector('a[href="/en/store"]')).not.toBeNull();
    expect(document.querySelector('a[href="/en/give"]')).not.toBeNull();
  });
});
