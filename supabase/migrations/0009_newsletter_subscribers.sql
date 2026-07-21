-- Public newsletter signup capture for the footer's "Stay Connected" form
-- (app/api/newsletter/route.ts). Inserts always go through that route's
-- service-role client, never directly from the browser -- RLS is enabled
-- with zero policies so it defaults to fully denied even if a future
-- anon-key code path is ever added by mistake.
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;
