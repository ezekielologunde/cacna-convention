create table pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references convention_editions(id) on delete cascade,
  category text not null check (category in ('adult', 'young_adult', 'child')),
  price_cents integer not null,
  starts_on date not null,
  ends_on date not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index pricing_tiers_edition_idx on pricing_tiers (edition_id, category, starts_on);

alter table pricing_tiers enable row level security;

create policy "pricing_tiers readable by everyone"
  on pricing_tiers for select
  using (true);

create policy "pricing_tiers writable by admins"
  on pricing_tiers for all
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()))
  with check (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));
