// Confirmed directly (2026-07-17) against this year's convention flyer text --
// matches the venue_address already recorded on the 2026 convention_editions
// row ("Blue Ridge Summit, PA"), just with the full street address and ZIP
// added. The flyer text itself misspelled it "Blue Bridge Summit" -- the ZIP
// (17214) belongs to the real Blue Ridge Summit, PA, so that's used here.
export const venueAddress = "14051 Stahley Road, Blue Ridge Summit, PA 17214";

export type Airport = {
  name: string;
  distanceMiles: number;
};

export const recommendedAirport: Airport = {
  name: "Baltimore-Washington International (BWI)",
  distanceMiles: 77,
};

export const nearbyAirports: Airport[] = [
  { name: "Hagerstown Regional Airport", distanceMiles: 14 },
  { name: "Frederick Municipal Airport", distanceMiles: 22 },
  { name: "Harrisburg International Airport", distanceMiles: 50 },
];

export const drivingRoute = "BWI → I-195 → I-95 → I-695 → I-70 → I-270 → US-15 → local roads to CAC Village";

export const budgetLodgingNote = "Budget rooms from around $40/night are available via Hotwire, in addition to the group-rate hotels above.";
