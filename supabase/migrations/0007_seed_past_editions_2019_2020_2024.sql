-- Backfills three past convention editions found missing from the archive
-- (2019, 2020, 2024) during a Wayback Machine crawl of cacnaconvention.org's
-- older printed program PDFs -- verified directly by downloading and
-- extracting each PDF's text. Matches the existing 2022/2023 rows' pattern
-- (edition row only, no schedule_sessions -- session-level detail wasn't
-- transcribed for these years).
--
-- 2020's convention was held virtually via Zoom due to the COVID-19
-- pandemic, so it has no physical venue -- venue_name/venue_address reflect
-- that instead of reusing the CAC Village address.
insert into convention_editions (year, theme, starts_on, ends_on, venue_name, venue_address, status)
values
  (2019, 'That the Scripture Might Be Fulfilled', '2019-07-15', '2019-07-20', 'CAC Village', '14051 Stahley Road, Blue Ridge Summit, PA 17214', 'past'),
  (2020, 'God in the Administration of Man', '2020-07-15', '2020-07-17', 'Virtual (Zoom Video Conference)', 'Held via Zoom video conference due to the COVID-19 pandemic', 'past'),
  (2024, 'Spiritual Power and Gifts for the Body of Christ', '2024-07-15', '2024-07-20', 'CAC Village', '14051 Stahley Road, Blue Ridge Summit, PA 17214', 'past');
