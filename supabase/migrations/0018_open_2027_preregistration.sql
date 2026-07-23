-- Opens 2027 pre-registration early, ahead of the previously-announced
-- October 2026 public opening (see 0010_seed_pricing_tiers_2027_placeholder.sql).
-- The site owner explicitly chose to open now with real Stripe payments,
-- confirming the placeholder pricing from 0010 stands as final (2026-07-23).
-- Moves each category's earliest tier starts_on forward to today so
-- getActivePricingForEdition() finds an active tier immediately -- ends_on
-- (and every later tier) is untouched, so the existing early-bird/late/
-- door-rate schedule is unchanged, just reachable sooner.
update pricing_tiers
set starts_on = '2026-07-23'
where edition_id = 'fbbdd449-4a54-408e-95e5-ca9827c95576'
  and starts_on = '2026-10-01';
