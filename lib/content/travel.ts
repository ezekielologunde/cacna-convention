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

// Distances corrected 2026-07-22 against live Google Maps driving directions
// to the actual venue address -- the original flyer-sourced figures for
// Hagerstown/Frederick/Harrisburg were meaningfully understated (Harrisburg
// alone was off by roughly 14 miles). BWI's figure already matched the real
// distance via the route this page describes, so it's unchanged.
export const recommendedAirport: Airport = {
  name: "Baltimore-Washington International (BWI)",
  distanceMiles: 77,
};

export const nearbyAirports: Airport[] = [
  { name: "Hagerstown Regional Airport", distanceMiles: 19 },
  { name: "Frederick Municipal Airport", distanceMiles: 27 },
  { name: "Harrisburg International Airport", distanceMiles: 64 },
];

export const drivingRoute = "BWI → I-195 → I-95 → I-695 → I-70 → I-270 → US-15 → local roads to CAC Village";

// A meaningfully shorter alternative Google Maps also offers from BWI --
// worth surfacing since it saves real time, even though it isn't the route
// this page's turn-by-turn description above follows.
export const drivingRouteAlt =
  "A shorter alternative from BWI: I-95 → MD-140 W, saving roughly 10 miles over the route above.";

export const budgetLodgingNote =
  "Budget rooms from around $40/night are available via Hotwire, in addition to the group-rate hotels above.";

// Ground-transportation reality check (researched 2026-07-22): rideshare
// apps list "coverage" here, but this is a wooded, rural stretch of South
// Mountain, PA -- real driver availability and pickup wait times aren't
// guaranteed the way they are in a city. The one airport shuttle actually
// serving this corridor (BayRunner, BWI ↔ Hagerstown, MD) stops in downtown
// Hagerstown -- roughly 20-30 minutes short of the venue itself, not a
// direct connection. Renting a car, or riding with a fellow attendee who's
// driving, is the practical way to reach and get around the venue.
export const groundTransportNote =
  "This is a rural, wooded area — rideshare apps list coverage here, but pickup times aren't guaranteed the way they are in a city, and the nearest airport shuttle (BWI ↔ Hagerstown, MD) stops about 20-30 minutes short of the venue. Renting a car, or riding with a fellow attendee who's driving, is strongly recommended.";

export type ClimateInfo = {
  averageHighF: number;
  averageLowF: number;
  note: string;
};

// Mid-July climate normals for the Waynesboro, PA station -- the nearest
// modeled station to Blue Ridge Summit, which has no dedicated weather
// station of its own (researched 2026-07-22 via Weather Spark climate-
// normal data).
export const julyClimate: ClimateInfo = {
  averageHighF: 85,
  averageLowF: 68,
  note: "July is the muggiest month of the year here, with meaningful rain on roughly 1 in 3 days. Warm, humid days and cooler evenings — pack breathable clothing, a light rain layer, and sun protection.",
};

// The venue sits within/adjacent to Michaux State Forest (85,000 wooded
// acres across South Mountain, confirmed via the PA DCNR's own Michaux
// State Forest page and the Beartown Woods Natural Area entry, which lists
// Blue Ridge Summit as its nearest town) -- genuinely remote, not just
// "rural-sounding."
export const remotenessNote =
  "CAC Village sits within Michaux State Forest, an 85,000-acre wooded area on South Mountain — plan for a genuinely rural stretch, not just a quiet suburb.";

export type PackingItem = {
  label: string;
};

export const packingChecklist: PackingItem[] = [
  { label: "Breathable, warm-weather clothing for hot, humid days" },
  { label: "A light rain layer or umbrella" },
  { label: "Sunscreen and a hat" },
  { label: "Comfortable shoes for walking the grounds" },
  { label: "A light jacket or sweater for cooler evenings" },
  { label: "Cash, in case a nearby stop doesn't take cards" },
];
