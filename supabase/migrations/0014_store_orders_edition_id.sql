-- store_orders had no link to a convention edition at all -- merchandise
-- purchases couldn't be grouped by year the way registrations already can
-- via registrations.edition_id. Nullable (not backfilled retroactively --
-- zero orders exist as of this writing, and a purchase isn't intrinsically
-- tied to an edition the way a registration is) -- stamped going forward by
-- app/api/store/checkout/route.ts at checkout time from whatever edition is
-- active then.
alter table store_orders
  add column edition_id uuid references convention_editions(id);
