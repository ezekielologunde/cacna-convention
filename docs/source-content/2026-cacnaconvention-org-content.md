# Source content scraped from cacnaconvention.org (2026-07-16)

Reference material pulled from the live WordPress site this project replaces. Treat as seed data — re-confirm with organizers before using in production copy, especially anything time-sensitive (pricing deadlines, schedule details).

Raw HTML for every crawled page is archived outside the repo at the crawl scratchpad (not committed — too large/noisy to be useful as source). This file and `assets/` hold the distilled, reusable output.

## Full 2026 schedule (transcribed from `assets/2026-schedule.jpg`)

**CHRIST APOSTOLIC CHURCH NORTH AMERICA 2026 CONVENTION SCHEDULE**
**Theme: The Bible, God's Message to Man**
**Monday, July 13th to Saturday, July 18th, 2026**

| Time | Monday Jul 13 | Tuesday Jul 14 | Wednesday Jul 15 | Thursday Jul 16 | Friday Jul 17 | Saturday Jul 18 |
|---|---|---|---|---|---|---|
| 9:00–10:00am | Daily General Opening Session — Praise/Worship and Prayer (all week) | | | 9:00–11:00am Sunday School General Session for All | | Holy Communion and Closing Service — Pastor S. O. Oladele, President, CAC Nigeria & Overseas |
| 10:00–11:30am | Registration | Ministers' Session 1 — "Transformative Power of The Word" — Pastor T. A. O. Agbeja, Regional Supt. Latunde Region | Ministers' Session 4 — Pastor S. O. Oladele, President, CAC Nigeria & Overseas | 11:15am–12:45pm Business Group General Session for All | Convention Program, 10am–2pm | |
| 11:30–11:45am | Break | | | | | |
| 11:45am–1:15pm | Registration | Ministers' Session 2 — "Divine Guide For Our Living" — Pastor Simeon Oladokun, Regional Supt. Anosike Region | Break Out #1 — CACMWF, CACMA, CACNAGWA, Youth/Young Adult, Children | 1:00–2:15pm Break Out #3 — CACMWF, CACMA, CACNAGWA, Youth/Young Adult, Children | | |
| 1:15–3:30pm | | Lunch Time | | 2:15–7:00pm Picnic, Sports & Games | Ordination Service, 2–5pm | |
| 3:30–5:00pm | | Ministers' Session 3 — "The Perfect Encourager In Time of Tries, Tribulations and Challenges" — Right Rev. Prof. Dapo F. Asaju, Bishop of Ijesha Diocese | Break Out #2 — CACMWF, CACMA, CACNAGWA, Youth/Young Adult, Children | | | |
| 5:00–7:00pm | Ministers Prayer Night — Prophet H. Oladeji, Gen. Evangelist, CAC Nigeria & Overseas | Revival Night — Prophet H. Oladeji, Gen. Evangelist, CAC Nigeria & Overseas | Revival Night — Prophet H. Oladeji, Gen. Evangelist, CAC Nigeria & Overseas | 7–9pm Praise Night | Impartation Night — Prophet H. Oladeji, Gen. Evangelist, CAC Nigeria & Overseas | |

Note: named ministers are already confirmed for most 2026 sessions — this is richer than the "speakers not guaranteed" assumption in the design spec. Keep the "Guest Minister" placeholder pattern in the schema regardless, since future years may not have names locked in this early; just seed this year's data with the real names above.

Full designed program (multi-page PDF, includes additional ads/sponsor pages) is archived at `assets/2026-convention-program.pdf`.

## Registration pricing (confirmed, matches earlier crawl)

| Category | Oct 1, 2025–Jan 31, 2026 | Feb 1–Apr 30, 2026 | May 1–Jul 10, 2026 | At convention ground |
|---|---|---|---|---|
| Adult (30+) | $125 | $150 | $200 | $250 |
| Young Adult (20–29) | $100 | $125 | $150 | $150 |
| Child (1–19) | Free | Free | Free | Free |

Food free for all ages throughout the convention. Payment currently via Zelle or credit/debit card.

## Travel

**Air**: Baltimore-Washington International (BWI) is the recommended airport, ~77 miles / ~1h25m drive to CAC Village. Eight alternative regional airports within 50 miles are listed, including Harrisburg International (50mi), Hagerstown Regional (14mi), Frederick Municipal (22mi).

**Road**: BWI → CAC Village (Blue Ridge Summit, PA) via I-195, I-95, I-695, I-70, I-270, US-15, then local roads through MD/PA.

**Budget lodging**: rates from ~$40/night via Hotwire, in addition to the named group-rate hotels already captured in the design spec (Chambersburg PA, Gettysburg PA, Hagerstown MD).

## Contacts

| Role | Name | Phone | Email | Org/Address |
|---|---|---|---|---|
| Convention Chairman | Pastor David Adenodi | 301-440-7033 | cacnaconvention@gmail.com | C.A.C. Vineyard of Comfort, 6408 Princess Garden Parkway, Lanham, MD 20706 |
| Convention Secretary | Pastor Timothy Famojuro | 917-709-1892 | ftimothy54@aol.com | C.A.C. FITA, Brooklyn, NY |
| General inquiries | Pastor Joseph Olawale | 305-469-0346 | cacna@hotmail.com | Christ Apostolic Church DFW Metroplex, Sanctuary of Power and Praise, 612 E. 2nd Street, Irving, TX 75060 |

Current site also has a generic "Send Message" contact form (fields not inspected — recreate with standard name/email/message fields).

## CACNA Superintendent page

Thin content on the live site — page title only, one section header ("C.A.C. North America Regional DCC/Zonal Superintendents"), and one photo whose filename references "Tunde Lawal" but with no surrounding bio text. **Needs a real content ask to organizers** — not enough here to seed a proper page. Flagged as an open item.

## Gallery

~40 photos from the 2025 convention (July 17–19, 2025) in a single uncaptioned grid, plus a separate "2025 Children Department" album. No structured captions/metadata exist to migrate — new gallery content should be sourced fresh from organizers (via the admin gallery-upload feature) rather than migrated as-is.

## Brand assets captured (`assets/`)

- `cacna-logo.png` — full lockup: circular emblem (Christ Apostolic Church, shepherd-and-sheep illustration, "One Fold, One Shepherd — John 10:16") + "CACNA [year] Annual Convention" wordmark in red/purple
- `cacna-icon.png` — the circular emblem alone (site favicon source)
- `2026-schedule.jpg` — full schedule graphic (transcribed above)
- `2026-convention-program.pdf` — full multi-page printed program
- `committee-david-adenodi.jpg` — committee chairman headshot

These are reference/mood-board material for the "propose a look" branding phase, not assets to reuse verbatim — the new site is getting its own visual identity per the design spec, informed by but not copied from this WordPress theme.
