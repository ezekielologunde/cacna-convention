// Verified directly (2026-07-20) against the live shop page at
// https://www.cacnachristianeducation.com/shop -- these are the only real,
// currently-listed products.

export type StoreItem = { name: string; price: string };

export const christianEducationMaterials: StoreItem[] = [
  { name: "2026 Youth & Young Adults Teenagers Sunday School Lesson", price: "$16.00" },
  { name: "2026 Pre-Teen Sunday School Lesson", price: "$16.00" },
  { name: "2026 Elementary Sunday School Lesson", price: "$16.00" },
  { name: "2026 Unified Bible Study Manual", price: "$18.00" },
  { name: "2026 Ọmi Ìyè Náà Ìwé Atọ́nisọ́nà Fún Àdúrà Ojoojúmọ́", price: "$20.00" },
  { name: "2026 Living Water Prayer and Bible Devotional", price: "$20.00" },
  { name: "2026 Àwọn Ẹ̀kọ́ Ilé Ẹ̀kọ́ Ọjọ́ Ìsimi tí Akẹ́kọ̀ọ́", price: "$18.00" },
  { name: "2026 Àwọn Ẹ̀kọ́ Ilé Ẹ̀kọ́ Ọjọ́ Ìsimi tí Olùkọ́", price: "$20.00" },
  { name: "2026 Sunday School Student's Copy", price: "$18.00" },
  { name: "2026 Sunday School Teacher's Copy", price: "$20.00" },
  { name: "2025–2026 Unified Bible Study Manual", price: "$18.00" },
  { name: "2025 Elementary Manual — Children & Godly Leadership", price: "$16.00" },
];

// Apparel is not connected to a real catalog yet -- the Shopify MCP
// connector available in this workspace isn't authorized. These are
// clearly-labeled DEMO items (see the "Demo" badge in the store page) so
// the section shows what a live apparel shop will look like without
// claiming to be real, purchasable inventory. Once the Shopify connector
// is authorized, replace each array below with a live product fetch
// (search_products) filtered by vendor/tag/product_type -- the StoreItem
// shape here intentionally matches what christianEducationMaterials uses,
// so the same card markup in the page component keeps working unchanged.

export const conventionApparelDemo: StoreItem[] = [
  { name: "2026 Convention T-Shirt", price: "$20.00" },
  { name: "2026 Convention Polo", price: "$28.00" },
];

export const goodWomenApparelDemo: StoreItem[] = [
  { name: "Good Women Association Tee", price: "$22.00" },
  { name: "Good Women Association Tote Bag", price: "$15.00" },
];

export const youthApparelDemo: StoreItem[] = [
  { name: "Youth & Young Adult Tee", price: "$18.00" },
  { name: "Youth & Young Adult Hoodie", price: "$32.00" },
];
