alter table schedule_sessions
  add column audience text[] not null default '{all}'::text[];

alter table schedule_sessions
  add constraint schedule_sessions_audience_valid
  check (audience <@ array['all','youth','adult','children']::text[]);

-- Backfill the real 2026 data: general sessions keep the 'all' default,
-- Ministers' Sessions/Prayer Night are adult-only, and the Break Out slots
-- run all three age-group programs (CACMWF/CACMA/CACNAGWA, Youth/Young
-- Adult, Children) in parallel rooms at once.
update schedule_sessions
  set audience = array['adult']::text[]
  where track = 'ministers';

update schedule_sessions
  set audience = array['youth','adult','children']::text[]
  where track = 'breakout';
