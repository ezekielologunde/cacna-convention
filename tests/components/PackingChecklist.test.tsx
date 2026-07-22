import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PackingChecklist } from "../../components/plan-your-visit/PackingChecklist";

const ITEMS = [{ label: "Sunscreen and a hat" }, { label: "A light rain layer or umbrella" }];

beforeEach(() => {
  window.localStorage.clear();
});

describe("PackingChecklist", () => {
  it("renders every item unchecked, with no reset button, when nothing is saved", () => {
    render(<PackingChecklist items={ITEMS} resetCta="Reset checklist" />);

    for (const item of ITEMS) {
      expect(screen.getByRole("checkbox", { name: item.label })).not.toBeChecked();
    }
    expect(screen.queryByRole("button", { name: "Reset checklist" })).not.toBeInTheDocument();
  });

  it("checking an item persists it to localStorage and shows the reset button", () => {
    render(<PackingChecklist items={ITEMS} resetCta="Reset checklist" />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Sunscreen and a hat" }));

    expect(screen.getByRole("checkbox", { name: "Sunscreen and a hat" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Reset checklist" })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("cacna-packing-checklist")!)).toEqual({
      "Sunscreen and a hat": true,
    });
  });

  it("restores checked state from localStorage on mount", async () => {
    window.localStorage.setItem("cacna-packing-checklist", JSON.stringify({ "Sunscreen and a hat": true }));

    render(<PackingChecklist items={ITEMS} resetCta="Reset checklist" />);

    expect(await screen.findByRole("checkbox", { name: "Sunscreen and a hat" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "A light rain layer or umbrella" })).not.toBeChecked();
  });

  it("reset clears both the UI state and localStorage", () => {
    render(<PackingChecklist items={ITEMS} resetCta="Reset checklist" />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Sunscreen and a hat" }));

    fireEvent.click(screen.getByRole("button", { name: "Reset checklist" }));

    expect(screen.getByRole("checkbox", { name: "Sunscreen and a hat" })).not.toBeChecked();
    expect(window.localStorage.getItem("cacna-packing-checklist")).toBeNull();
    expect(screen.queryByRole("button", { name: "Reset checklist" })).not.toBeInTheDocument();
  });
});
