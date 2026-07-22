export type EssentialCategory = "food" | "groceriesPharmacy" | "gas";

export type NearbyEssential = {
  name: string;
  category: EssentialCategory;
  address: string;
  area: string;
};

// Real, named businesses researched 2026-07-22 (store-locator pages and
// local business listings) within roughly a 15-minute drive of CAC Village,
// grouped by the small town/corridor they're actually in -- closest first
// (Blue Ridge Summit itself, then the Rouzerville/Buchanan Trail East
// corridor a few minutes further, then Waynesboro proper ~10-15 minutes
// out, then Smithsburg, MD as an alternate direction). Deliberately not
// exhaustive -- a curated, verifiable list beats a padded one.
export const nearbyEssentials: NearbyEssential[] = [
  { name: "Blue Ridge Food Mart", category: "groceriesPharmacy", address: "Buchanan Trail East", area: "Blue Ridge Summit, PA" },
  { name: "Sunoco", category: "gas", address: "15010 Buchanan Trail East", area: "Blue Ridge Summit, PA" },
  { name: "C&T / Exxon", category: "gas", address: "11055 Buchanan Trail East", area: "Rouzerville, PA" },
  { name: "Red Run Grill", category: "food", address: "11227 Buchanan Trail East", area: "Rouzerville, PA" },
  { name: "Christine's Cafe", category: "food", address: "11119 Buchanan Trail East", area: "Rouzerville, PA" },
  { name: "Michaux Brewing Company", category: "food", address: "11582 Buchanan Trail East", area: "Rouzerville, PA" },
  { name: "Brother's Pizza", category: "food", address: "11755 Buchanan Trail East", area: "Rouzerville, PA" },
  { name: "Walmart Supercenter", category: "groceriesPharmacy", address: "12751 Washington Township Blvd", area: "Waynesboro, PA" },
  { name: "Martin's Food Market", category: "groceriesPharmacy", address: "708 E Main St", area: "Waynesboro, PA" },
  { name: "CVS Pharmacy", category: "groceriesPharmacy", address: "406 E Main St", area: "Waynesboro, PA" },
  { name: "Rite Aid Pharmacy", category: "groceriesPharmacy", address: "1513 E Main St", area: "Waynesboro, PA" },
  { name: "Main Street Family Diner", category: "food", address: "1543 E Main St", area: "Waynesboro, PA" },
  { name: "The Waynesburger", category: "food", address: "100 W Main St", area: "Waynesboro, PA" },
  { name: "New York Pizza Express", category: "food", address: "304 W Main St", area: "Waynesboro, PA" },
  { name: "Trigger's Table & Taproom", category: "food", address: "118 Walnut St", area: "Waynesboro, PA" },
  { name: "Martin's / Giant", category: "groceriesPharmacy", address: "22401 Jefferson Blvd", area: "Smithsburg, MD" },
  { name: "Smithsburg Pharmacy", category: "groceriesPharmacy", address: "22026 Jefferson Blvd", area: "Smithsburg, MD" },
];
