# Homepage redesign + About page enrichment

## Context

The homepage currently has a minimal hero (`CACNA Convention` / `Christ Apostolic Church North America Convention`) and a short "What a CACNA week looks like" mission blurb. The source site (cacnaconvention.org) has richer real content that hasn't been brought over yet:

- A date/location banner and a pastoral "Welcome to CACNA Convention" greeting message on its homepage
- A dedicated "About CACNA Convention" page describing the convention's mission, doctrinal basis ("Biblically Based"), and focus ("Kingdom Focused") — distinct from the org's founding-history content already on our About page
- A "Registration Guidelines" list (5 rules)

This spec covers pulling that content in, adapted to this rebuild's actual state: the source content is written for the 2026 convention (already past/archived per this project's own docs — see `docs/source-content/2026-cacnaconvention-org-content.md`), and no 2027 edition exists in the database yet (confirmed via `select * from convention_editions` — only one row, `2026`, `status = 'past'`).

A PDF the user tried to attach for this work was corrupted in transit (truncated at 256KB vs. an expected ~574KB) and never successfully read. This spec does not depend on its contents; if re-uploaded later, treat any changes it implies as a follow-up.

## Goals

1. Redesign the homepage hero and add a real "Welcome" section, adapted for 2027 instead of reproducing 2026-specific dates.
2. Add a "View Gallery" CTA on the homepage linking to the existing Gallery page.
3. Enrich the About page's "Our Story" tab with the convention's mission statement and Biblically Based / Kingdom Focused pillars.
4. Move the Registration Guidelines onto the Register page.
5. Replace the abbreviated Rules & Etiquette list on Plan Your Visit with the full transcription from the printed convention program (page 31, "Convention and Conference Rules & Etiquette").

## Non-goals

- No visual/token redesign (color system, typography, spacing scale) — this is a content and information-architecture change within the existing flame/gold design system.
- No new database schema or edition data — the "no confirmed 2027 dates" state is handled the same way the rest of the site already handles it (conditional copy, no fabricated dates).

## Homepage changes (`app/(site)/[locale]/page.tsx`)

**Hero** (mostly unchanged mechanically, content updated):
- Kicker (small text above heading): `2027 · CAC Village, USA` — replaces the current kicker-less state. No specific days shown, since no 2027 edition/dates exist in the database yet.
- Heading: `CACNA Convention` (unchanged)
- Subtitle: `Christ Apostolic Church North America Convention` (unchanged)
- CTAs: Learn More / View Schedule (unchanged)

**New "Welcome to CACNA Convention" section**, inserted directly after the hero, before the existing mission section:
- Heading: `Welcome to CACNA Convention`
- Body: the greeting message from the source homepage ("Calvary greetings in the name of our Lord and Savior Jesus Christ..." through "...that we may please Him."), verbatim except the closing "feel free to contact us" reference becomes a real link to the site's own Contact page (`/{locale}/contact`) instead of the source site's contact page.

**Existing "What a CACNA week looks like" mission section** — kept as-is, unchanged, positioned after the new Welcome section.

**New Gallery CTA**, positioned after the mission section and before the Registration section:
- Short heading/body (e.g. "See highlights from our last convention") + a "View Gallery" button linking to `/{locale}/gallery`.

**Registration section, Give section** — unchanged.

## About page changes (`components/about/AboutTabs.tsx`, `app/(site)/[locale]/about/page.tsx`)

The "Our Story" tab currently renders two sentences (founding + reach) from `lib/content/history.ts`. Extend it with new content sourced from cacnaconvention.org's "About CACNA Convention" page, added as a new `lib/content/about-convention.ts` file:

- Mission statement paragraph ("The CACNA Convention exists to facilitate, extend and enlarge the Great Commission of Christ...")
- Two labeled bullet lists: "Biblically Based" (3 points) and "Kingdom Focused" (4 points)

The source page's closing "People of God, the Lord is calling us..." paragraph is **not** duplicated here — it's the same text going into the homepage's Welcome section, so it only needs to exist once. The definition sentence ("a large meeting of church members...") is also skippable as redundant with the mission statement that follows it — keep the mission statement as the lead, not the plain definition.

Rendered directly below the existing founding/reach paragraphs in the same `about-panel-story` tabpanel — no new tab, no new tablist entry.

## Register page changes (`components/register/RegistrationForm.tsx` or `RegisterPageClient.tsx`, `app/(site)/[locale]/register/page.tsx`)

Add a "Registration Guidelines" section listing the 5 rules from the source homepage, plus the "food is free for all ages" note. Exact placement (above vs. below the form, always visible vs. per registration mode) is an implementation-time call — keep it visually secondary to the form itself (the form is the primary task on this page).

## Rules & Etiquette changes (`lib/content/rules.ts`, `app/(site)/[locale]/plan-your-visit/page.tsx`)

`lib/content/rules.ts` currently holds an 8-item paraphrase (itself a summary from an earlier, shorter crawl). Replace it with the full transcription from the printed convention program's dedicated Rules & Etiquette page (page 31), which has two labeled sections and a chairman attribution the current data has none of:

- **Remember** (12 items) — orderly conduct (1 Cor. 14:40), being a good Christian example (Phil. 2:15), hallway/lobby conduct, noise, no cooking in hotel rooms, dress code (1 Thess. 4:4; Heb. 12:14-17), speech (Ecc. 5:6; 5:3-4), obedience to committee/ushers/protocol/security/hospitality/marketing/medical/registration staff, note-taking, respect for attendees/leaders, fellowship, and raising concerns respectfully (Phil. 2:14)
- **Rules** (11 items) — ID tag requirement, 10-minute early arrival, keeping surroundings clean, parking rules (including not parking near youth/children/kitchen areas), no eating in halls, no water packs in hotel rooms, toilet/sanitary rules, no littering, trash disposal, and daily morning prayer sessions
- Signed: "Pastor David Olusegun Adenodi (Ph.D), Chairman, CACNA Conventions & Conferences"

Restructure `rules.ts` to carry this shape (two labeled groups + attribution) instead of a flat `string[]`, and update the Plan Your Visit page's Rules & Etiquette section to render both groups with headings, plus the attribution line.

## Content/translation additions

**Correction from first draft:** every existing "real content" file in this project (`lib/content/leadership.ts`, `committee.ts`, `hotels.ts`, `rules.ts`, `gallery.ts`, `superintendents.ts`, `history.ts`) is English-only, sourced verbatim from the English source site — none of it goes through next-intl. Only the short UI chrome *around* that content (section headings, tab labels, button text) is translated via `messages/en.json` + `messages/yo.json`. The new long-form content added by this spec follows the same split:

**New English-only content files** (`lib/content/`, no Yoruba needed):
- `about-convention.ts` — mission statement + Biblically Based / Kingdom Focused points
- `welcome.ts` (or extend an existing file) — the homepage welcome/greeting message body
- `rules.ts` — restructured to hold the full Remember/Rules transcription + attribution (still English-only, consistent with its current state)
- Registration Guidelines body text (new file, or extend an existing one)

**New translated UI-chrome keys** (both `messages/en.json` and `messages/yo.json`, real Yoruba — not placeholders, per `tests/i18n/messages.test.ts` parity):
- `Home.kicker` (re-added — was removed in the last session's cleanup pass, now needed again with different content: location/date instead of the org name)
- `Home.welcomeHeading` ("Welcome to CACNA Convention")
- `Home.galleryTeaserHeading`, `Home.galleryTeaserCta`
- `About.missionHeading` (or similar), `About.biblicallyBasedHeading`, `About.kingdomFocusedHeading`
- `Register.guidelinesHeading`
- `PlanYourVisit.rememberHeading`, `PlanYourVisit.rulesHeading` (rulesHeading already exists), attribution label if needed

## Testing

- Extend `tests/app/home.test.tsx` to assert the Welcome section and Gallery CTA render.
- Extend `tests/components/AboutTabs.test.tsx` to assert the mission/pillars content renders in the Our Story panel.
- Extend or add a Register page test asserting the guidelines render.
- `tests/i18n/messages.test.ts` (key parity) must keep passing — every new English key needs a real Yoruba translation, not a placeholder.

## Verification

Same as every other change this session: `npm test`, `npm run build`, then a live check on production after deploy (screenshots are unreliable this session — use DOM/network inspection via the browser tools instead, as established earlier).
