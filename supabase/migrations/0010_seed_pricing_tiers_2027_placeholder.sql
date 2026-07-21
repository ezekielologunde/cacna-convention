-- PLACEHOLDER pricing for the 2027 convention (edition_id
-- fbbdd449-4a54-408e-95e5-ca9827c95576, July 12-17, 2027) -- not an
-- independently confirmed 2027 price. These are last year's (2026) real,
-- flier-sourced fees (see 0008_seed_pricing_tiers_2026.sql) carried over
-- verbatim as a stand-in, with each date window shifted forward exactly one
-- year so the cutovers land in the 2026-2027 cycle instead of 2025-2026.
-- The site owner explicitly chose this placeholder-over-nothing option
-- (2026-07-21) while aware these are not confirmed 2027 numbers. Replace
-- with real values the moment 2027 pricing is actually announced.
insert into pricing_tiers (edition_id, category, price_cents, starts_on, ends_on, sort_order)
values
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'adult', 12500, '2026-10-01', '2027-01-31', 0),
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'adult', 15000, '2027-02-01', '2027-04-30', 1),
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'adult', 20000, '2027-05-01', '2027-07-10', 2),
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'adult', 25000, '2027-07-11', '2027-07-17', 3),
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'young_adult', 10000, '2026-10-01', '2027-01-31', 0),
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'young_adult', 12500, '2027-02-01', '2027-04-30', 1),
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'young_adult', 15000, '2027-05-01', '2027-07-10', 2),
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'young_adult', 15000, '2027-07-11', '2027-07-17', 3),
  ('fbbdd449-4a54-408e-95e5-ca9827c95576', 'child', 0, '2026-10-01', '2027-07-17', 0);
