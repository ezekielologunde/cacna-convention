-- Lets a registration be marked complimentary (no Stripe charge) --
-- backs the Register page's third "Complimentary" tab, used for
-- staff/comp registrations rather than the general public paying via
-- Stripe or reporting a manual Zelle/check payment.
alter table registrations add column is_complimentary boolean not null default false;
