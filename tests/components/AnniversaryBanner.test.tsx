import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AnniversaryBanner } from "../../components/ui/AnniversaryBanner";
import { anniversary } from "../../lib/content/anniversary";
import messages from "../../messages/en.json";

const DISMISSED_KEY = "cacna-anniversary-banner-dismissed";

function renderBanner() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AnniversaryBanner />
    </NextIntlClientProvider>
  );
}

describe("AnniversaryBanner", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders the anniversary message with a link to the celebration page", () => {
    renderBanner();

    expect(screen.getByText(/Celebrating 50 years of CAC North America/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Learn more/ })).toHaveAttribute("href", anniversary.moreInfoUrl);
  });

  it("dismisses on close and records it in sessionStorage", () => {
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByText(/Celebrating 50 years of CAC North America/)).not.toBeInTheDocument();
    expect(sessionStorage.getItem(DISMISSED_KEY)).toBe("1");
  });

  it("renders nothing on mount when already dismissed this session", () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");

    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });
});
