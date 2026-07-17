create table schedule_sessions (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references convention_editions(id) on delete cascade,
  day_date date not null,
  starts_at time not null,
  ends_at time not null,
  title text not null,
  minister_name text,
  minister_title text,
  track text not null default 'general',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index schedule_sessions_edition_idx on schedule_sessions (edition_id, day_date, starts_at);

alter table schedule_sessions enable row level security;

create policy "schedule_sessions readable by everyone"
  on schedule_sessions for select
  using (true);

create policy "schedule_sessions writable by admins"
  on schedule_sessions for all
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()))
  with check (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));
