import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QrCode } from "../../components/ui/QrCode";

describe("QrCode", () => {
  it("renders the given SVG markup with an accessible label", () => {
    render(<QrCode svg="<svg><rect /></svg>" label="Check-in QR code for this registration" />);

    const el = screen.getByRole("img", { name: "Check-in QR code for this registration" });
    expect(el.querySelector("rect")).not.toBeNull();
  });
});
