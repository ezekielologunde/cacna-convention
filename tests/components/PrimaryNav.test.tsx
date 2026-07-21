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

const PROGRAM_NAMES = [
  "Youth & Young Ministry",
  "Children's Program",
  "Good Women Conference",
  "Ministers' Wives Conference",
  "CACMA (Men's Association)",
  "Christian Education",
  "Business Group Fellowship",
];

function renderNav() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PrimaryNav />
    </NextIntlClientProvider>
  );
}

describe("PrimaryNav", () => {
  it("renders the primary nav items plus a Programs dropdown trigger", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Programs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Schedule" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Live" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute("href", "/en/news");
  });

  it("no longer renders a plain 'Register' text link -- the primary CTA button is the only path to /register", () => {
    renderNav();
    // The CTA button's accessible name is "Register Now" (its aria-label),
    // distinct from the bare "Register" text link this nav used to also
    // render alongside it.
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register Now →" })).toHaveAttribute("href", "/en/register");
  });

  it("renders a dominant Register Now CTA and a secondary Give button", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Register Now →" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Give" })).toBeInTheDocument();
  });

  it("renders an Account nav link instead of an inline theme toggle", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/en/account");
    expect(screen.queryByRole("button", { name: /switch to (dark|light) mode/i })).not.toBeInTheDocument();
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
    expect(within(panel).getByRole("link", { name: "Account" })).toHaveAttribute("href", "/en/account");

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

  describe("Programs dropdown (desktop)", () => {
    it("is closed by default and opens to reveal all 7 department pages", () => {
      renderNav();

      expect(document.getElementById("programs-menu")).not.toBeInTheDocument();
      const trigger = screen.getByRole("button", { name: "Programs" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const panel = document.getElementById("programs-menu")!;
      for (const name of PROGRAM_NAMES) {
        expect(within(panel).getByRole("link", { name })).toBeInTheDocument();
      }
      expect(within(panel).getByRole("link", { name: "Youth & Young Ministry" })).toHaveAttribute(
        "href",
        "/en/youth"
      );
    });

    it("closes when a department link is clicked", () => {
      renderNav();
      fireEvent.click(screen.getByRole("button", { name: "Programs" }));
      const panel = document.getElementById("programs-menu")!;

      fireEvent.click(within(panel).getByRole("link", { name: "Youth & Young Ministry" }));

      expect(document.getElementById("programs-menu")).not.toBeInTheDocument();
    });

    it("closes on Escape and returns focus to the trigger", () => {
      renderNav();
      const trigger = screen.getByRole("button", { name: "Programs" });
      fireEvent.click(trigger);
      expect(document.getElementById("programs-menu")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(document.getElementById("programs-menu")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it("closes on a click outside the dropdown", () => {
      renderNav();
      fireEvent.click(screen.getByRole("button", { name: "Programs" }));
      expect(document.getElementById("programs-menu")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      expect(document.getElementById("programs-menu")).not.toBeInTheDocument();
    });
  });

  describe("Programs accordion (mobile)", () => {
    it("expands within the mobile menu to reveal all 7 department pages", () => {
      renderNav();
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      const mobilePanel = document.getElementById("primary-mobile-menu")!;

      expect(document.getElementById("mobile-programs-menu")).not.toBeInTheDocument();
      const trigger = within(mobilePanel).getByRole("button", { name: "Programs" });
      fireEvent.click(trigger);

      const subPanel = document.getElementById("mobile-programs-menu")!;
      for (const name of PROGRAM_NAMES) {
        expect(within(subPanel).getByRole("link", { name })).toBeInTheDocument();
      }
    });

    it("collapses when the whole mobile menu is closed and reopened", () => {
      renderNav();
      const menuToggle = screen.getByRole("button", { name: "Open menu" });
      fireEvent.click(menuToggle);
      fireEvent.click(within(document.getElementById("primary-mobile-menu")!).getByRole("button", { name: "Programs" }));
      expect(document.getElementById("mobile-programs-menu")).toBeInTheDocument();

      // Close then reopen the whole mobile menu.
      fireEvent.click(menuToggle);
      fireEvent.click(menuToggle);

      expect(document.getElementById("mobile-programs-menu")).not.toBeInTheDocument();
    });
  });
});
