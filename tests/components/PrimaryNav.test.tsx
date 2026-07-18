import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { PrimaryNav } from "../../components/navigation/PrimaryNav";
import messages from "../../messages/en.json";

// `usePathname` needs a real Next.js App Router context, which isn't present
// in this plain jsdom test render -- it returns `null` unmocked, which then
// throws inside the component's own `pathname.startsWith(...)` active-link
// check (same class of issue as the `next-intl/server` mock elsewhere in
// this test suite; `pathname` is never actually null in real usage). Mocked
// per-test below via `mockPathname` so each test controls which link (if
// any) should render as active.
let mockPathname = "/en";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

function renderNav() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PrimaryNav />
    </NextIntlClientProvider>
  );
}

describe("PrimaryNav", () => {
  it("renders the six primary nav items", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Schedule" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Live" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute("href", "/en/news");
  });

  it("renders a dominant Register Now CTA and a secondary Give button", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Register Now" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Give" })).toBeInTheDocument();
  });

  it("keeps About/Live/Give reachable on mobile via a menu toggle", () => {
    renderNav();

    // The mobile menu panel is what restores reachability on small screens
    // (the header-row items are only hidden by CSS media queries, which
    // jsdom doesn't evaluate) — it shouldn't exist in the DOM until opened.
    expect(document.getElementById("primary-mobile-menu")).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById("primary-mobile-menu")!;
    expect(within(panel).getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "Live" })).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "News" })).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "Give" })).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole("link", { name: "About" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the current page's nav link with aria-current, and no other", () => {
    mockPathname = "/en/schedule";
    renderNav();

    expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");

    mockPathname = "/en";
  });
});
