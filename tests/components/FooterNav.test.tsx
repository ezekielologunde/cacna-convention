import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { FooterNav } from "../../components/navigation/FooterNav";
import messages from "../../messages/en.json";
import { externalResources } from "../../lib/content/external-resources";

function renderFooter() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <FooterNav />
    </NextIntlClientProvider>
  );
}

describe("FooterNav", () => {
  it("renders the four secondary nav links", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Plan Your Visit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gallery" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Archive" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders a News link", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute("href", "/en/news");
  });

  it("renders external CAC resource links", () => {
    renderFooter();
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
});
