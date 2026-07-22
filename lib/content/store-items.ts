// Verified directly (2026-07-20) against the live shop page at
// https://www.cacnachristianeducation.com/shop -- these are the only real,
// currently-listed products. Cover images downloaded from that same shop
// page (2026-07-21) and self-hosted under public/photos/store/ rather than
// hotlinked, matching the gallery photos' pattern of repo-owned images.

export type StoreItem = { name: string; price: string; imageSrc: string };

export const christianEducationMaterials: StoreItem[] = [
  { name: "2026 Youth & Young Adults Teenagers Sunday School Lesson", price: "$16.00", imageSrc: "/photos/store/store-2026-youth-young-adults-lesson.jpg" },
  { name: "2026 Pre-Teen Sunday School Lesson", price: "$16.00", imageSrc: "/photos/store/store-2026-pre-teen-lesson.jpg" },
  { name: "2026 Elementary Sunday School Lesson", price: "$16.00", imageSrc: "/photos/store/store-2026-elementary-lesson.jpg" },
  { name: "2026 Unified Bible Study Manual", price: "$18.00", imageSrc: "/photos/store/store-2026-unified-bible-study-manual.jpg" },
  { name: "2026 Ọmi Ìyè Náà Ìwé Atọ́nisọ́nà Fún Àdúrà Ojoojúmọ́", price: "$20.00", imageSrc: "/photos/store/store-2026-omi-iye-naa.jpg" },
  { name: "2026 Living Water Prayer and Bible Devotional", price: "$20.00", imageSrc: "/photos/store/store-2026-living-water-devotional.jpg" },
  { name: "2026 Àwọn Ẹ̀kọ́ Ilé Ẹ̀kọ́ Ọjọ́ Ìsimi tí Akẹ́kọ̀ọ́", price: "$18.00", imageSrc: "/photos/store/store-2026-eko-ile-eko-akekoo.jpg" },
  { name: "2026 Àwọn Ẹ̀kọ́ Ilé Ẹ̀kọ́ Ọjọ́ Ìsimi tí Olùkọ́", price: "$20.00", imageSrc: "/photos/store/store-2026-eko-ile-eko-oluko.jpg" },
  { name: "2026 Sunday School Student's Copy", price: "$18.00", imageSrc: "/photos/store/store-2026-sunday-school-student-copy.jpg" },
  { name: "2026 Sunday School Teacher's Copy", price: "$20.00", imageSrc: "/photos/store/store-2026-sunday-school-teacher-copy.jpg" },
  { name: "2025–2026 Unified Bible Study Manual", price: "$18.00", imageSrc: "/photos/store/store-2025-2026-unified-bible-study-manual.jpg" },
  { name: "2025 Elementary Manual — Children & Godly Leadership", price: "$16.00", imageSrc: "/photos/store/store-2025-elementary-manual.jpg" },
];

// Apparel used to live here as clearly-labeled DEMO items (no Shopify
// connector was authorized). It's now a real, purchasable catalog backed by
// the store_products table (see lib/store.ts) with a Stripe Checkout flow
// (app/api/store/checkout/route.ts) -- see supabase/migrations for the
// seeded rows.
