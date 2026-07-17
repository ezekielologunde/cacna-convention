create table registrations (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references convention_editions(id) on delete restrict,
  registration_type text not null check (registration_type in ('individual', 'group')),
  church_name text,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')) default 'pending',
  total_amount_cents integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table registrants (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  full_name text not null,
  category text not null check (category in ('adult', 'young_adult', 'child')),
  price_cents integer not null,
  created_at timestamptz not null default now()
);

create index registrants_registration_idx on registrants (registration_id);
create index registrations_edition_idx on registrations (edition_id, status);

alter table registrations enable row level security;
alter table registrants enable row level security;

-- No public select/insert/update policy at all: these tables hold PII and
-- payment state. Every write goes through a server-side API route using the
-- service-role client (bypasses RLS by design). Admins get an explicit
-- read policy for defense-in-depth / a future direct-client admin dashboard.
create policy "registrations readable by admins"
  on registrations for select
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));

create policy "registrants readable by admins"
  on registrants for select
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));
