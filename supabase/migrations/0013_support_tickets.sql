create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_tickets_attendee_idx on support_tickets (attendee_id, created_at desc);

alter table support_tickets enable row level security;

create policy "support_tickets readable by owning attendee"
  on support_tickets for select
  using (attendee_id = auth.uid());

create policy "support_tickets insertable by owning attendee"
  on support_tickets for insert
  with check (attendee_id = auth.uid());

create policy "support_tickets readable by admins"
  on support_tickets for select
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));
