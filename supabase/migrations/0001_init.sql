create table convention_editions (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique,
  theme text not null,
  starts_on date not null,
  ends_on date not null,
  venue_name text not null,
  venue_address text not null,
  status text not null check (status in ('upcoming', 'current', 'past')) default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one edition may be "current" at a time.
create unique index one_current_edition
  on convention_editions (status)
  where status = 'current';

create table admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table convention_editions enable row level security;
alter table admin_profiles enable row level security;

create policy "convention_editions readable by everyone"
  on convention_editions for select
  using (true);

create policy "convention_editions writable by admins"
  on convention_editions for all
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()))
  with check (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));

create policy "admin_profiles readable by self"
  on admin_profiles for select
  using (id = auth.uid());
