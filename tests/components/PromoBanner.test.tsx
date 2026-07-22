import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { PromoBanner } from "../../components/register/PromoBanner";
import messages from "../../messages/en.json";

describe("PromoBanner", () => {
  it("renders the price-increase message with a Register CTA", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PromoBanner nextDeadline="2027-01-31" priceBeforeIncrease={12500} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(/125/)).toBeInTheDocument();
    expect(screen.getByText(/2027-01-31/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register Now" })).toBeInTheDocument();
  });

  it("renders a coming-soon message and CTA instead of vanishing when there's no active pricing yet", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PromoBanner nextDeadline={null} priceBeforeIncrease={null} />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByText("Registration for Convention 2027 opens in October 2026.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get notified — view registration" })).toHaveAttribute(
      "href",
      "/en/register"
    );
  });
});
