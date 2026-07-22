import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TravelTabs } from "../../components/plan-your-visit/TravelTabs";

const PROPS = {
  flyingLabel: "Flying",
  drivingLabel: "Driving",
  venueHeading: "CAC Village address",
  venueAddress: "14051 Stahley Road, Blue Ridge Summit, PA 17214",
  recommendedAirportLabel: "Recommended airport",
  recommendedAirport: { name: "Baltimore-Washington International (BWI)", distanceMiles: 77 },
  recommendedAirportMilesLabel: "77 miles from CAC Village",
  otherAirportsHeading: "Other nearby airports",
  nearbyAirports: [
    { name: "Hagerstown Regional Airport", distanceMiles: 19 },
    { name: "Frederick Municipal Airport", distanceMiles: 27 },
    { name: "Harrisburg International Airport", distanceMiles: 64 },
  ],
  groundTransportNote: "Renting a car is strongly recommended.",
  drivingHeading: "Driving from BWI",
  drivingRoute: "BWI → I-195 → I-95 → I-695 → I-70 → I-270 → US-15 → local roads to CAC Village",
  drivingRouteAlt: "A shorter alternative from BWI: I-95 → MD-140 W.",
};

describe("TravelTabs", () => {
  it("shows the Flying panel by default, with the recommended airport and ground-transport note", () => {
    render(<TravelTabs {...PROPS} />);

    expect(screen.getByRole("tab", { name: "Flying" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Baltimore-Washington International (BWI)")).toBeInTheDocument();
    expect(screen.getByText("77 miles from CAC Village")).toBeInTheDocument();
    expect(screen.getByText("Hagerstown Regional Airport")).toBeInTheDocument();
    expect(screen.getByText("Renting a car is strongly recommended.")).toBeInTheDocument();
    expect(screen.queryByText(PROPS.drivingRoute)).not.toBeInTheDocument();
  });

  it("switches to the Driving panel on click, showing the route and the shorter alternative", () => {
    render(<TravelTabs {...PROPS} />);

    fireEvent.click(screen.getByRole("tab", { name: "Driving" }));

    expect(screen.getByRole("tab", { name: "Driving" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(PROPS.drivingRoute)).toBeInTheDocument();
    expect(screen.getByText(PROPS.drivingRouteAlt)).toBeInTheDocument();
    expect(screen.queryByText("Baltimore-Washington International (BWI)")).not.toBeInTheDocument();
  });

  it("switches tabs with the arrow keys", () => {
    render(<TravelTabs {...PROPS} />);

    fireEvent.keyDown(screen.getByRole("tab", { name: "Flying" }), { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Driving" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Driving" })).toHaveFocus();
  });
});
