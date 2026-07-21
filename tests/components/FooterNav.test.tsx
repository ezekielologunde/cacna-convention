import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { externalResources } from "../../lib/content/external-resources";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// FooterNav is now a Server Component (only FooterLink, its client leaf,
// needs usePathname()) -- see tests/app/archive.test.tsx for why
// next-intl/server is mocked here the same way every page test does.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

// See tests/components/PrimaryNav.test.tsx for why next/navigation is
// mocked here -- usePathname needs a real App Router context, unavailable
// in this plain jsdom render.
let mockPathname = "/en";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

async function renderFooter() {
  // Dynamically imported (rather than a static top-level import) so
  // FooterNav.tsx -- and its own static "next-intl/server" import -- only
  // loads after `messages`/`createNextIntlServerMock` above have actually
  // initialized; a static import here gets hoisted ahead of those and
  // throws "Cannot access ... before initialization" the moment the mock
  // factory runs. Same reasoning as tests/app/archive.test.tsx's
  // resolveRegisterCta.
  const { FooterNav } = await import("../../components/navigation/FooterNav");
  const Footer = await FooterNav({ locale: "en" });
  return render(<NextIntlClientProvider locale="en" messages={messages}>{Footer}</NextIntlClientProvider>);
}

describe("FooterNav", () => {
  it("renders the four secondary nav links", async () => {
    await renderFooter();
    expect(screen.getByRole("link", { name: "Plan Your Visit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gallery" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Archive" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders a News link", async () => {
    await renderFooter();
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute("href", "/en/news");
  });

  it("renders external CAC resource links", async () => {
    await renderFooter();
    // Regex, not a plain string: getByRole's `name` option ignores `exact`
    // for string matchers (always exact-equality) -- only RegExp/function
    // matchers do a partial match. Each link's accessible name also
    // includes an "(opens in a new tab)" suffix via aria-label for screen
    // reader users.
    for (const resource of externalResources) {
      expect(
        screen.getByRole("link", { name: new RegExp(`^${resource.label}`) })
      ).toHaveAttribute("href", resource.url);
    }
  });

  it("marks the current page's footer link with aria-current, and no other", async () => {
    mockPathname = "/en/gallery";
    await renderFooter();

    expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Archive" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Contact" })).not.toHaveAttribute("aria-current");

    mockPathname = "/en";
  });
});
