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
