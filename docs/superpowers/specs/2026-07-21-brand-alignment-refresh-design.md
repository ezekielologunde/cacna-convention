# Brand alignment refresh: fonts, nav, footer, content density

## Context

The user asked for the Convention site to feel "more fuller," use the same
fonts as "the CACNA site," match its nav bar, and give the footer a similar
but distinct look — plus tighter prose within existing sections.

"The CACNA site" needed disambiguating: `cacnorthamerica.com` itself
currently resolves to an old WordPress/Avia-theme site (navy blue,
Muli/Trebuchet MS, no relation to this project's design tokens). The real
target is `cacnorthamerica.vercel.app`, a modern Next.js rebuild that uses
this project's own red (`#C81E3A`) / gold (`#FDC841`) brand verbatim — the
site `app/globals.css`'s "unified with the sibling cacnorthamerica.com
site's own red/gold brand" comment was actually written against. Verified
live (2026-07-21):

- Fonts: body = **Plus Jakarta Sans**, headings = **Bricolage Grotesque**
  (via `getComputedStyle`). This project's own `lib/fonts.ts` comment notes
  Bricolage Grotesque was "the previous" display face here before a switch
  to Unbounded — the two sites have since drifted apart.
- A slim dismissible top banner ("50th Anniversary · October 10, 2026...
  Learn more →" + an X) — structurally near-identical to this project's own
  `AnniversaryBanner`, added earlier this session. Good sign the two sites
  are already converging independently.
- Nav: circular seal icon + small-caps org kicker + title lockup; grouped
  items ("Events & Convention", "Who We Are", "Media", "Give", "Contact");
  a circular search icon; a red→gold gradient pill CTA ("Convention 2027
  →") linking to `https://cacnaconvention.org/` — their real production
  domain for what is apparently this same convention project, distinct from
  this project's own placeholder `SITE_URL` fallback.
- Footer: dark band; a "Contact the Regional Office →" CTA; icon-bulleted
  address/phone/email block; a gold-accented "Get updates from the family"
  email-signup band; a 4-column link footer; a bottom bar with copyright,
  utility links, and "Back to top".

This project's own nav (`components/navigation/PrimaryNav.tsx`) and footer
(`components/navigation/FooterNav.tsx`) cover a much larger page set (11+
real subpages plus 7 program pages) than the sibling's 5-item nav, since
this site is just the one convention rather than the whole regional org.
Decision (confirmed with the user): match the sibling's **visual style**,
keep **this site's own page set and grouping**.

## Goals

1. Swap the sitewide font stack to Bricolage Grotesque (display) + Plus
   Jakarta Sans (body), matching the sibling exactly.
2. Polish the nav bar's visual details to match the sibling's treatment
   (circular logo mark, red→gold gradient CTA, trailing arrow) without
   changing this site's own page set or dropdown structure.
3. Redesign the footer with a "Contact the Convention Committee" CTA and a
   real email-signup feature (new DB table + API route + form), inspired by
   but distinct from the sibling's footer.
4. Tighten prose in existing page sections (no section removal).

## Non-goals

- No change to `cacnorthamerica.com`/`cacnorthamerica.vercel.app` — this
  project only reads from it as a design reference.
- No literal adoption of the sibling's 5-item nav grouping — this site
  keeps its own 11+ pages, grouped as they already are today (Programs
  dropdown), just re-skinned.
- No CAPTCHA/Turnstile integration for the newsletter signup — a hidden
  honeypot field is enough spam mitigation for a low-stakes footer form,
  keeping this feature dependency-free (this project has no local
  CAPTCHA-verification route today; the one existing Turnstile use, on
  login, delegates verification to Supabase Auth itself, which a plain
  email-capture form has no equivalent for).
- No exhaustive line-by-line rewrite of every page's copy — the content
  density pass targets identifiably verbose paragraphs, not a full audit.

## A. Fonts (`lib/fonts.ts`)

Replace:

```ts
import { Unbounded, Hanken_Grotesk } from "next/font/google";
...
export const displayFont = Unbounded({ variable: "--font-heading", subsets: ["latin", "vietnamese"] });
export const bodyFont = Hanken_Grotesk({ variable: "--font-body", subsets: ["latin", "vietnamese"] });
```

with:

```ts
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
...
export const displayFont = Bricolage_Grotesque({ variable: "--font-heading", subsets: ["latin", "vietnamese"] });
export const bodyFont = Plus_Jakarta_Sans({ variable: "--font-body", subsets: ["latin", "vietnamese"] });
```

Same CSS custom-property names (`--font-heading`/`--font-body`), so nothing
downstream (`globals.css`, both root layouts) needs to change. `next/font/google`
validates the `subsets` array against Google's font metadata at build time —
if `"vietnamese"` isn't a valid subset key for either family, `next build`
fails immediately and loudly, so this is self-verifying at implementation
time.

Note: the homepage hero's `<h1>` currently overrides the display face back
to the body font inline (`style={{ fontFamily: "var(--font-body)" }}`,
added last session because Unbounded's heavy geometric letterforms clashed
with the body copy at 96px). Bricolage Grotesque is a lighter-weight,
closer-to-body grotesque than Unbounded — re-evaluate that override once
the swap lands; it may no longer be needed (visual judgment call at
implementation time, not a blocking requirement).

## B. Navigation (`components/navigation/PrimaryNav.tsx`, `app/globals.css`)

Three targeted changes, everything else (page set, dropdown mechanics,
mobile menu) untouched:

1. **Circular logo mark**: change the logo `<Image>`'s className from
   `rounded-xl` to `rounded-full` (both the desktop nav instance and the
   matching mark in `FooterNav.tsx`'s brand column, for consistency). If
   `/brand/icon.png`'s artwork crops awkwardly as a circle (it may not be
   designed as a circular seal), fall back to `rounded-xl` — a visual call
   made at implementation time by actually looking at the rendered result.
2. **Red→gold gradient CTA**: add a new token to `app/globals.css`,
   alongside the existing `--gradient-cta`/`--gradient-hero` tokens:

   ```css
   --gradient-cta-gold: linear-gradient(100deg, #c81e3a 0%, #fdc841 100%); /* min white 5.67:1 at the red end -- verify the gold end's contrast requirement is met by pairing with dark (#16121a) text there instead, same as Badge's gold tone */
   ```

   Apply it only to the nav's "Register Now" button (a `style` override on
   that one `<Button>` instance, not a change to `Button`'s shared `primary`
   variant, which stays on the all-red gradient everywhere else it's used).
   Since the gradient transitions from red to gold, text color can't stay a
   uniform white across the whole pill — use dark (`#16121a`) text instead
   (matching `Badge`'s gold-tone precedent), so it reads clearly against
   both ends of the gradient.
3. **Trailing arrow**: append " →" to the Register button's `registerCta`
   translation value (`Nav.registerCta` in both `messages/en.json` and
   `messages/yo.json`), matching the sibling's "Convention 2027 →" pattern.
   The mobile-width short label (`Nav.register`, "Register") stays
   arrow-less — it's already compact enough for its context.

## C. Footer (`components/navigation/FooterNav.tsx`, new files below)

**"Contact the Convention Committee" CTA** — a new red pill link, in the
brand column, pointing at `/{locale}/contact`, above the existing
Register/YouTube/RSS button row.

**Newsletter signup** ("Stay Connected" band) — a real feature:

- New migration `supabase/migrations/0009_newsletter_subscribers.sql`
  (next number after the existing `0001`–`0008` files), following this
  project's existing migration style (plain `create table`, explicit RLS
  policy per operation, prose comment explaining the security rationale):

  ```sql
  create table newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    created_at timestamptz not null default now()
  );

  alter table newsletter_subscribers enable row level security;

  -- Public signup form, no auth -- inserts only, via the service-role key
  -- from app/api/newsletter/route.ts (same pattern as app/api/register/route.ts).
  -- No anon-role policy is added since the form never talks to Supabase
  -- directly; RLS is enabled with zero policies so even a
  -- future anon-key code path defaults to fully denied rather than open.
  ```

- New route `app/api/newsletter/route.ts` (`POST`), modeled on
  `app/api/register/route.ts`'s structure: parse JSON in a try/catch (400 on
  invalid body), hand-rolled email validation (non-empty, matches a basic
  `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` shape — no schema library, consistent with
  this project's existing validation style), a honeypot field (e.g.
  `website`) that, if non-empty, returns a **200 success response without
  inserting anything** (silently discards the spam submission rather than
  revealing the honeypot exists via an error), `createServiceClient()` to
  insert, and a caught unique-constraint violation (Postgres error code
  `23505`) mapped to a distinct `{ status: "already_subscribed" }` response
  rather than a 500.
- New `components/navigation/NewsletterForm.tsx` client component: email
  input + a visually-hidden (not `display:none`, which some bots skip —
  off-screen via absolute positioning, matching standard honeypot practice)
  `website` text input + submit button + status states
  (`idle | submitting | success | already | error`), each rendering the
  matching translated message.
- New translations, `Footer` namespace: `newsletterHeading`,
  `newsletterBody`, `newsletterPlaceholder`, `newsletterCta`,
  `newsletterSuccess`, `newsletterAlready`, `newsletterError`,
  `contactCommitteeCta` (real Yoruba in both `messages/en.json` and
  `messages/yo.json`, per `tests/i18n/messages.test.ts`'s key-parity check).

**Structural columns** (Attend/Programs/Connect/Contact) stay as they are
today — only the surrounding fonts/gradient tokens change via A/B above.

## D. Content density

A copy-tightening pass over existing page sections (Home, About, News,
Plan Your Visit, etc.): shorten identifiably verbose paragraphs to their
essential sentence, cut redundant phrases ("in order to" → "to", throat-
clearing lead-ins), no section removal, no fact changes. Applied as a
judgment-based editing pass at implementation time against a simple
standard (one clear idea per sentence) rather than an exhaustive per-
paragraph transcript in this spec — flag any page afterward that still
feels bloated.

## Testing

- No dedicated font unit test — `next build`'s validation of the `subsets`
  array against Google's font metadata is the real gate for an invalid
  subset choice, so a redundant test here wouldn't add coverage.
- New `tests/app/api/newsletter.test.ts`: valid email inserts and returns
  success; duplicate email returns `already_subscribed` (mock the service
  client's insert to reject with a `23505`-coded error); a filled honeypot
  field returns success **without** calling insert at all (assert the mock
  insert function was never called); invalid email/malformed JSON returns
  400.
- New `tests/components/NewsletterForm.test.tsx`: renders the form; submit
  with a valid email shows the success state; a mocked "already_subscribed"
  API response shows that specific message; the honeypot field exists in
  the DOM but is not visible (assert on its styling/positioning, not just
  presence).
- Extend `tests/components/FooterNav.test.tsx`: the "Contact the Convention
  Committee" link renders with the correct href.
- Extend `tests/components/PrimaryNav.test.tsx` (if it exists) or add
  a light assertion somewhere covering the Register button's updated label
  ("Register Now →").
- `tests/i18n/messages.test.ts` must keep passing with all new keys.

## Verification

`npm test`, `npx tsc --noEmit`, `npx next build` (the real gate for the
font-subset swap), then a live browser check: confirm both locales render
in the new fonts without a FOUT/layout-shift regression, the nav's
Register button shows the new gradient + arrow, the footer's committee CTA
and newsletter form both work (including a real submission and a duplicate-
email resubmission), and spot-check 2–3 pages for the content-density pass.
