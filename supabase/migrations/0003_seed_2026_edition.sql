insert into convention_editions (id, year, theme, starts_on, ends_on, venue_name, venue_address, status)
values (
  '00000000-0000-0000-0000-000000000026',
  2026,
  'The Bible: God''s Message to Man',
  '2026-07-13',
  '2026-07-18',
  'CAC Village',
  'Blue Ridge Summit, PA',
  'past'
);

insert into schedule_sessions (edition_id, day_date, starts_at, ends_at, title, minister_name, minister_title, track, sort_order)
values
  ('00000000-0000-0000-0000-000000000026', '2026-07-13', '09:00', '10:00', 'Daily General Opening Session — Praise/Worship and Prayer', null, null, 'general', 1),
  ('00000000-0000-0000-0000-000000000026', '2026-07-13', '10:00', '11:30', 'Registration', null, null, 'general', 2),
  ('00000000-0000-0000-0000-000000000026', '2026-07-13', '11:45', '13:15', 'Registration', null, null, 'general', 3),
  ('00000000-0000-0000-0000-000000000026', '2026-07-13', '17:00', '19:00', 'Ministers Prayer Night', 'Prophet H. Oladeji', 'Gen. Evangelist, CAC Nigeria & Overseas', 'ministers', 4),

  ('00000000-0000-0000-0000-000000000026', '2026-07-14', '10:00', '11:30', 'Ministers'' Session 1 — Transformative Power of The Word', 'Pastor T. A. O. Agbeja', 'Regional Supt. Latunde Region', 'ministers', 1),
  ('00000000-0000-0000-0000-000000000026', '2026-07-14', '11:45', '13:15', 'Ministers'' Session 2 — Divine Guide For Our Living', 'Pastor Simeon Oladokun', 'Regional Supt. Anosike Region', 'ministers', 2),
  ('00000000-0000-0000-0000-000000000026', '2026-07-14', '13:15', '15:30', 'Lunch Time', null, null, 'general', 3),
  ('00000000-0000-0000-0000-000000000026', '2026-07-14', '15:30', '17:00', 'Ministers'' Session 3 — The Perfect Encourager In Time of Tries, Tribulations and Challenges', 'Right Rev. Prof. Dapo F. Asaju', 'Bishop of Ijesha Diocese', 'ministers', 4),
  ('00000000-0000-0000-0000-000000000026', '2026-07-14', '17:00', '19:00', 'Revival Night', 'Prophet H. Oladeji', 'Gen. Evangelist, CAC Nigeria & Overseas', 'general', 5),

  ('00000000-0000-0000-0000-000000000026', '2026-07-15', '10:00', '11:30', 'Ministers'' Session 4', 'Pastor S. O. Oladele', 'President, CAC Nigeria & Overseas', 'ministers', 1),
  ('00000000-0000-0000-0000-000000000026', '2026-07-15', '11:45', '13:15', 'Break Out #1 — CACMWF, CACMA, CACNAGWA, Youth/Young Adult, Children', null, null, 'breakout', 2),
  ('00000000-0000-0000-0000-000000000026', '2026-07-15', '15:30', '17:00', 'Break Out #2 — CACMWF, CACMA, CACNAGWA, Youth/Young Adult, Children', null, null, 'breakout', 3),
  ('00000000-0000-0000-0000-000000000026', '2026-07-15', '17:00', '19:00', 'Revival Night', 'Prophet H. Oladeji', 'Gen. Evangelist, CAC Nigeria & Overseas', 'general', 4),

  ('00000000-0000-0000-0000-000000000026', '2026-07-16', '09:00', '11:00', 'Sunday School General Session for All', null, null, 'general', 1),
  ('00000000-0000-0000-0000-000000000026', '2026-07-16', '11:15', '12:45', 'Business Group General Session for All', null, null, 'general', 2),
  ('00000000-0000-0000-0000-000000000026', '2026-07-16', '13:00', '14:15', 'Break Out #3 — CACMWF, CACMA, CACNAGWA, Youth/Young Adult, Children', null, null, 'breakout', 3),
  ('00000000-0000-0000-0000-000000000026', '2026-07-16', '14:15', '19:00', 'Picnic, Sports & Games', null, null, 'general', 4),
  ('00000000-0000-0000-0000-000000000026', '2026-07-16', '19:00', '21:00', 'Praise Night', null, null, 'general', 5),

  ('00000000-0000-0000-0000-000000000026', '2026-07-17', '10:00', '14:00', 'Convention Program', null, null, 'general', 1),
  ('00000000-0000-0000-0000-000000000026', '2026-07-17', '14:00', '17:00', 'Ordination Service', null, null, 'general', 2),
  ('00000000-0000-0000-0000-000000000026', '2026-07-17', '17:00', '19:00', 'Impartation Night', 'Prophet H. Oladeji', 'Gen. Evangelist, CAC Nigeria & Overseas', 'general', 3),

  ('00000000-0000-0000-0000-000000000026', '2026-07-18', '09:00', '10:00', 'Holy Communion and Closing Service', 'Pastor S. O. Oladele', 'President, CAC Nigeria & Overseas', 'general', 1);
