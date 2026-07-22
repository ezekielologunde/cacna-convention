-- Lets a signed-out visitor submit a support ticket (via the site-wide chat
-- shortcut) without an attendee account. Anonymous submissions go through a
-- service-role API route (bypasses RLS), so no policy changes are needed --
-- the existing attendee-owned insert/select policies are untouched.
alter table support_tickets alter column attendee_id drop not null;
alter table support_tickets add column name text;
alter table support_tickets add column email text;

alter table support_tickets add constraint support_tickets_identity_check
  check (attendee_id is not null or email is not null);
