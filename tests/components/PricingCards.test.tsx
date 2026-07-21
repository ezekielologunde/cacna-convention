import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PricingCards, type PricingCardCategory } from "../../components/register/PricingCards";

const categories: PricingCardCategory[] = [
  {
    key: "adult",
    label: "Adult (30+)",
    tiers: [
      { id: "t1", priceLabel: "$125", dateLabel: "Through Jan 31, 2027", isCurrent: false },
      { id: "t2", priceLabel: "$150", dateLabel: "Through Apr 30, 2027", isCurrent: true },
    ],
  },
  {
    key: "child",
    label: "Child (1–19)",
    tiers: [{ id: "t3", priceLabel: "Free", dateLabel: "Through Jul 17, 2027", isCurrent: false }],
  },
];

describe("PricingCards", () => {
  it("renders one card per category with each tier's price and date", () => {
    render(<PricingCards categories={categories} currentRateLabel="Current Rate" />);

    expect(screen.getByRole("heading", { name: "Adult (30+)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Child (1–19)" })).toBeInTheDocument();
    expect(screen.getByText("$125")).toBeInTheDocument();
    expect(screen.getByText("Through Jan 31, 2027")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("marks only the current tier with the current-rate badge", () => {
    render(<PricingCards categories={categories} currentRateLabel="Current Rate" />);

    const badges = screen.getAllByText("Current Rate");
    expect(badges).toHaveLength(1);
  });
});
