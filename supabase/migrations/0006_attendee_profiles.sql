-- Attendee (public, self-service) accounts -- distinct from admin_profiles,
-- which is an allow-list with no insert policy (provisioned out-of-band).
-- attendee_profiles gets a self-insert policy since self-service is the
-- whole point: an attendee signing up via magic-link can never satisfy
-- requireAdmin()'s admin_profiles lookup, and vice versa. Do not add an
-- insert policy to admin_profiles -- that asymmetry is the actual security
-- boundary between "can sign up as an attendee" and "can become an admin".
create table attendee_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table attendee_profiles enable row level security;

create policy "attendee_profiles readable by self"
  on attendee_profiles for select
  using (id = auth.uid());

create policy "attendee_profiles insertable by self"
  on attendee_profiles for insert
  with check (id = auth.uid());
