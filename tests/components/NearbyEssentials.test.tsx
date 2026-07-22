import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NearbyEssentials } from "../../components/plan-your-visit/NearbyEssentials";
import type { NearbyEssential } from "../../lib/content/nearby-essentials";

const ITEMS: NearbyEssential[] = [
  { name: "Red Run Grill", category: "food", address: "11227 Buchanan Trail East", area: "Rouzerville, PA" },
  { name: "Walmart Supercenter", category: "groceriesPharmacy", address: "12751 Washington Township Blvd", area: "Waynesboro, PA" },
  { name: "Sunoco", category: "gas", address: "15010 Buchanan Trail East", area: "Blue Ridge Summit, PA" },
];

const FILTER_LABELS = {
  all: "All",
  food: "Food",
  groceriesPharmacy: "Groceries & Pharmacy",
  gas: "Gas",
};

describe("NearbyEssentials", () => {
  it("shows every item, grouped by area, under the default All filter", () => {
    render(<NearbyEssentials items={ITEMS} groupLabel="Filter by category" filterLabels={FILTER_LABELS} />);

    expect(screen.getByText("Red Run Grill")).toBeInTheDocument();
    expect(screen.getByText("Walmart Supercenter")).toBeInTheDocument();
    expect(screen.getByText("Sunoco")).toBeInTheDocument();
    expect(screen.getByText("Rouzerville, PA")).toBeInTheDocument();
    expect(screen.getByText("Waynesboro, PA")).toBeInTheDocument();
    expect(screen.getByText("Blue Ridge Summit, PA")).toBeInTheDocument();
  });

  it("filters down to just the selected category", () => {
    render(<NearbyEssentials items={ITEMS} groupLabel="Filter by category" filterLabels={FILTER_LABELS} />);

    fireEvent.click(screen.getByRole("button", { name: "Food" }));

    expect(screen.getByText("Red Run Grill")).toBeInTheDocument();
    expect(screen.queryByText("Walmart Supercenter")).not.toBeInTheDocument();
    expect(screen.queryByText("Sunoco")).not.toBeInTheDocument();
  });

  it("marks the active filter with aria-pressed", () => {
    render(<NearbyEssentials items={ITEMS} groupLabel="Filter by category" filterLabels={FILTER_LABELS} />);

    const allButton = screen.getByRole("button", { name: "All" });
    const gasButton = screen.getByRole("button", { name: "Gas" });
    expect(allButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(gasButton);

    expect(allButton).toHaveAttribute("aria-pressed", "false");
    expect(gasButton).toHaveAttribute("aria-pressed", "true");
  });
});
