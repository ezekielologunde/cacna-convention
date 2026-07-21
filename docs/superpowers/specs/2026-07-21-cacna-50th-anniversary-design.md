# CACNA 50th Anniversary celebration (site-wide)

## Context

Christ Apostolic Church North America turns 50 in 2026 (founded 1976). A
dedicated event page for the celebration already exists on the sibling
cacnorthamerica.com site
(`https://cacnorthamerica.com/events/cacna-50th-anniversary-2026`), and this
convention site already lists the event once, on the News page, via
`lib/content/news-events.ts`:

- Title: "CAC North America 50th Anniversary Celebration"
- Date: October 10, 2026
- Location: CAC Village, USA
- Description: "Christ Apostolic Church North America celebrates 50 years
  since its founding in 1976, at CAC Village — the same grounds that host the
  annual convention."

The user wants this celebrated "all over the site," not just as one line item
on the News page: a big feature on the homepage, plus a smaller persistent
presence on every other page, in a visual style that's mostly elegant/gold but
includes one tasteful animated touch.

Design tokens already reserve gold (`--color-gold: #fdc841`) for dark
surfaces only — gold text on the white page background (or white text on a
gold fill) fails contrast (~1.5:1). Gold fill + dark (`#16121a`) text is safe
anywhere (already used by the footer's Register button); gold text is safe on
the existing dark bands (`--gradient-band`, used by the Watch section and
footer).

## Goals

1. One canonical source of truth for the anniversary facts, consumed by the
   News page (existing) and every new surface below.
2. A dismissible, site-wide top announcement bar (every page).
3. A permanent, non-dismissible badge in the footer (every page).
4. A homepage hero nod (upgrade the existing "Est. 1976" badge).
5. A dedicated, prominent homepage section — the "big celebration" moment —
   with one restrained animated/festive touch (decorative gold confetti dots,
   CSS-only).
6. A new `gold` tone on the shared `Badge` component, reusable beyond this
   feature.

## Non-goals

- No changes to the cacnorthamerica.com site itself — this convention site
  only links out to its existing dedicated event page.
- No new animation library/dependency — the confetti touch is pure CSS
  `@keyframes`, consistent with this project's existing hand-rolled motion
  (`Reveal`, `Parallax`, `hero-kenburns`) and automatically covered by the
  project's existing global `prefers-reduced-motion` rule in
  `app/globals.css`.
- No new gradient token — the dark sections reuse the existing
  `--gradient-band` token already used by the Watch section/footer.

## Content: `lib/content/anniversary.ts` (new)

Single source of truth:

```ts
export const anniversary = {
  years: 50,
  foundingYear: 1976,
  date: "2026-10-10", // ISO, matches lib/content/news-events.ts's existing format
  location: "CAC Village, USA",
  description:
    "Christ Apostolic Church North America celebrates 50 years since its founding in 1976, at CAC Village — the same grounds that host the annual convention.",
  moreInfoUrl: "https://cacnorthamerica.com/events/cacna-50th-anniversary-2026",
};
```

English-only (not run through next-intl), matching this project's existing
convention for owner-provided facts (`news-events.ts`, `history.ts`, etc.).

**Refactor `lib/content/news-events.ts`**: its existing 50th-anniversary
entry is rebuilt from this shared const (`date: anniversary.date`, etc.)
instead of repeating the same strings, so there's one place to update if a
detail (date, URL, wording) ever changes. The entry's `title` stays a
News-page-specific string (`"CAC North America 50th Anniversary
Celebration"`) since that's page-specific framing, not a shared fact.

This must not change any of `tests/app/news.test.tsx`'s existing assertions —
the extracted values must be byte-identical to what's there today (verified
by running that suite after the refactor).

## `Badge` component: new `gold` tone

`components/ui/Badge.tsx` currently supports `neutral | red | blue`. Add:

```ts
gold: "bg-[var(--color-gold)] text-[#16121a]",
```

Gold fill + dark text — the same safe pairing already used by the footer's
Register button (`FooterNav.tsx`). Safe on any background.

## Site-wide: dismissible announcement bar

New `components/ui/AnniversaryBanner.tsx` (client component):

- Mounted in `app/(site)/[locale]/layout.tsx`, above `<PrimaryNav />` — shows
  on every page.
- Background `var(--gradient-band)` (dark ink — same tone as the Watch
  section and footer; deliberately *not* the red `--gradient-cta`
  `PromoBanner` uses, so the two are visually distinct and never confused,
  and so gold text is safe to use here).
- Content: gold-accented label + white body text (e.g. "Celebrating 50 Years
  of CAC North America"), a text link to `anniversary.moreInfoUrl` (external,
  `target="_blank" rel="noopener noreferrer"`, aria-label suffixed with
  "(opens in a new tab)" per this project's existing convention), and a close
  (×) button, styled like the existing icon buttons in `FooterNav.tsx`.
- Dismiss behavior: clicking × hides the bar and calls
  `sessionStorage.setItem("cacna-anniversary-banner-dismissed", "1")`. On
  mount, if that key is already set, render nothing. This means the banner
  reappears on the next visit/new session — it is never dismissed
  permanently.
- New `Anniversary` translation namespace (both `messages/en.json` and
  `messages/yo.json`, real Yoruba per this project's key-parity test):
  `bannerText`, `bannerCta`, `dismissLabel`, `opensInNewTab`.

## Site-wide: permanent footer badge

In `components/navigation/FooterNav.tsx`'s brand column (near the existing
logo/org name), add a small gold-outlined pill:

- Text: "50th Anniversary · 1976–2026" (or similar, from a new
  `Footer.anniversaryBadge` key).
- Links to `anniversary.moreInfoUrl`, `target="_blank"
  rel="noopener noreferrer"`, aria-label suffixed with the existing
  `Footer.opensInNewTab` key.
- Gold text is safe here directly — the footer's background is already the
  dark `--gradient-band`.
- Always visible, no dismiss/interaction needed beyond the link itself.

## Homepage hero nod

In `app/(site)/[locale]/page.tsx`, the existing badge:

```tsx
<Badge tone="red">{t("establishedBadge", { year: history.foundingYear })}</Badge>
```

becomes:

```tsx
<Badge tone="gold">{t("establishedBadge", { year: history.foundingYear })}</Badge>
```

with `Home.establishedBadge`'s copy updated to reference the 50th explicitly
(e.g. "Celebrating 50 Years · Est. {year}") rather than adding a second badge
alongside it — an in-place upgrade, not additional clutter in an already
busy hero.

## Homepage: dedicated `AnniversarySection`

New `components/home/AnniversarySection.tsx`, a Server Component (translations
only, no async data fetch), inserted in `app/(site)/[locale]/page.tsx`
directly after the hero `<section>` and before the existing `id="welcome-section"`
Welcome band — the second thing every visitor sees.

Structure:

- `<section style={{ background: "var(--gradient-band)" }}>` — same dark
  band as the Watch section, so gold text is safe throughout.
- A handful (4–6) of small `aria-hidden` decorative "confetti" dots
  (rounded rects, gold + white/30, absolutely positioned, rotated), animated
  with a new CSS `@keyframes sparkle-float` (subtle vertical drift + opacity
  pulse, looping). No new dependency; automatically respects
  `prefers-reduced-motion` via the existing global rule in
  `app/globals.css`.
- A large gold display numeral "50" (`font-display`, large size,
  `text-[var(--color-gold)]`) as the section's focal element.
- Heading (white, wrapped in `<Reveal>`): from `Home.anniversaryHeading`.
- Body (white/80): `anniversary.description` (plain, not translated — see
  Content section above).
- Date/location line (gold, small-caps style): "October 10, 2026 · CAC
  Village, USA", built from `anniversary.date`/`anniversary.location`, date
  formatted the same way the rest of the homepage formats dates (see
  `formatDate` in `page.tsx`).
- A `Button` (`variant="primary"`) linking to `anniversary.moreInfoUrl`,
  `target="_blank" rel="noopener noreferrer"`, aria-label suffixed with
  `Home.opensInNewTab` (new key, following the same per-namespace suffix
  pattern used elsewhere — e.g. `Footer.opensInNewTab`, `News.opensInNewTab`).
  Label from `Home.anniversaryCta`.

New `Home` namespace keys (both `messages/en.json` and `messages/yo.json`):
`anniversaryHeading`, `anniversaryCta`, `opensInNewTab` (confirmed: `Home`
has no `opensInNewTab` key today, unlike `Footer`/`News`/`Give`/etc., so this
is a genuinely new key, not a duplicate).

## Testing

- `tests/app/news.test.tsx`: must keep passing unchanged after the
  `news-events.ts` refactor (byte-identical values).
- New `tests/components/AnniversaryBanner.test.tsx`: renders with the
  expected text/link; dismiss button hides it and sets sessionStorage;
  re-mounting with that sessionStorage key already set renders nothing.
- Extend `tests/components/FooterNav.test.tsx`: asserts the footer badge
  renders with the correct href.
- Extend `tests/app/home.test.tsx`: asserts the hero badge's new copy and the
  new `AnniversarySection` heading/CTA render.
- `tests/i18n/messages.test.ts` (key parity) must keep passing — every new
  key needs a real Yoruba translation, not a placeholder.

## Verification

`npm test`, `npx tsc --noEmit`, then a live check in the browser preview:
confirm the banner appears on a non-homepage page and dismisses correctly,
the footer badge renders and links out, and the homepage hero badge +
`AnniversarySection` render with working contrast in both light and dark
site themes.
