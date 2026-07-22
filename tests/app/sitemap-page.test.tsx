import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { vi } from "vitest";

// Named sitemap-page.test.tsx (not sitemap.test.tsx) to avoid colliding with
// any future test for app/sitemap.ts, the machine-readable XML sitemap --
// this file tests app/(site)/[locale]/sitemap/page.tsx, the human-readable
// one.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("SitemapPage", () => {
  it("renders every real page on the site, grouped", async () => {
    const { default: SitemapPage } = await import("../../app/(site)/[locale]/sitemap/page");
    const Page = await SitemapPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Site Map", level: 1 })).toBeInTheDocument();

    const hrefs = [
      "/en/register",
      "/en/schedule",
      "/en/plan-your-visit",
      "/en/store",
      "/en/give",
      "/en/about",
      "/en/news",
      "/en/live",
      "/en/archive",
      "/en/contact",
      "/en/youth",
      "/en/children",
      "/en/good-women",
      "/en/ministers-wives",
      "/en/cacma",
      "/en/christian-education",
      "/en/business-group",
      "/en/account",
    ];
    for (const href of hrefs) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it("groups pages under Convention, About & News, Programs, and Account headings", async () => {
    const { default: SitemapPage } = await import("../../app/(site)/[locale]/sitemap/page");
    const Page = await SitemapPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Convention" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About & News" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Programs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Account" })).toBeInTheDocument();
  });

  it("links back to the homepage", async () => {
    const { default: SitemapPage } = await import("../../app/(site)/[locale]/sitemap/page");
    const Page = await SitemapPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/en");
  });
});
