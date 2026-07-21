-- Archival record of the 2026 convention's registration fees, sourced from
-- the official CACNA 2026 Annual Convention flier. The 2026 edition is
-- already `status = 'past'` (convention ran July 13-18, 2026, and today is
-- past that), so this data does not affect the live /register flow --
-- getActiveEdition() only ever considers 'current'/'upcoming' editions. This
-- exists purely as an accurate historical record for the Archive page.
insert into pricing_tiers (edition_id, category, price_cents, starts_on, ends_on, sort_order)
values
  ('00000000-0000-0000-0000-000000000026', 'adult', 12500, '2025-10-01', '2026-01-31', 0),
  ('00000000-0000-0000-0000-000000000026', 'adult', 15000, '2026-02-01', '2026-04-30', 1),
  ('00000000-0000-0000-0000-000000000026', 'adult', 20000, '2026-05-01', '2026-07-10', 2),
  ('00000000-0000-0000-0000-000000000026', 'adult', 25000, '2026-07-11', '2026-07-18', 3),
  ('00000000-0000-0000-0000-000000000026', 'young_adult', 10000, '2025-10-01', '2026-01-31', 0),
  ('00000000-0000-0000-0000-000000000026', 'young_adult', 12500, '2026-02-01', '2026-04-30', 1),
  ('00000000-0000-0000-0000-000000000026', 'young_adult', 15000, '2026-05-01', '2026-07-10', 2),
  ('00000000-0000-0000-0000-000000000026', 'young_adult', 15000, '2026-07-11', '2026-07-18', 3),
  ('00000000-0000-0000-0000-000000000026', 'child', 0, '2025-10-01', '2026-07-18', 0);
