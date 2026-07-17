# CACNA Convention 2026 — Website & PWA Design Spec

**Date:** 2026-07-16
**Status:** Approved for implementation planning

## 1. Overview

This project is a full rebuild of the official website and registration platform for the **CACNA Convention 2026** — the national convention of Christ Apostolic Church North America (CACNA), a week-long gathering (July 13–18, 2026, at CAC Village, Blue Ridge Summit, PA) drawing member churches from across North America. Theme: *"The Bible: God's Message to Man."*

This site **becomes the official platform**, replacing the registration/payment flow currently run on the existing WordPress site (`cacnaconvention.org`). It launches as an installable, bilingual (English/Yoruba) Progressive Web App, with a native app-store wrapper (via Capacitor) planned as a later phase once the PWA is stable.

A sister project for a member church, `cac-salvation-center`, already runs the same core stack (Next.js + Supabase + Vercel) and is the primary source of reusable architecture patterns referenced throughout this spec.

## 2. Goals

- Replace the current WordPress registration flow with a real online-payment system (Stripe) supporting age-tiered pricing and church/group registration.
- Give organizers an admin dashboard to see registrations, track payments/giving, and manage the schedule.
- Make registration the dominant call-to-action across the entire site.
- Serve the site bilingually (English/Yoruba) with a full language toggle.
- Ship as an installable PWA now; keep the door open to a Capacitor-wrapped native app later without a rewrite.

## 3. Non-goals (this phase)

- No dedicated Speakers page — convention ministers/speakers are not confirmed far enough in advance. Schedule sessions may show a "Guest Minister" placeholder instead of a bio.
- No native App Store / Play Store submission in this phase (PWA only; native wrap is a future phase).
- No CMS-driven editing for rarely-changing content (Leadership, Committee, Rules & Etiquette) — this ships as versioned code content, not admin-editable, since it changes a few times a year at most.

## 4. Source content

Real content was crawled from the current `cacnaconvention.org` and seeds the new build:

- **Registration pricing** (age-tiered, time-windowed):
  - Adult (30+): $125 (Oct 1, 2025–Jan 31, 2026) → $150 (Feb 1–Apr 30, 2026) → $200 (May 1–Jul 10, 2026) → $250 (at convention ground)
  - Young Adult (20–29): $100 → $125 → $150 → $150 (at ground)
  - Child (1–19): Free
  - Food is free for all attendees during the convention.
- **Venue & lodging**: CAC Village, Blue Ridge Summit, PA; partner hotels in Chambersburg PA, Gettysburg PA, and Hagerstown MD under group code "Christ Apostolic Church CACNA."
- **Leadership**: 5 named CACNA leaders with titles (Chairman, Secretary, Treasurer, etc.)
- **Convention Committee**: Chairman, Secretary, PRO with contact info.
- **History**: CAC North America began as a house fellowship in 1976 (Rev. Goke Oyedeji, Brooklyn, NY); today spans 16 DCCs/Zones across the US and Canada.
- **Rules & Etiquette**: dress code, conduct, ID-tag, punctuality, and food-ticket rules carried over from the current site.

These are seed/reference data for the initial build; exact current-year figures should be re-confirmed with organizers before launch.

## 5. Information architecture

**Primary navigation** (5 items, kept deliberately short):
- Home
- About *(tabbed sections: Our Story · Leadership · Committee)*
- Schedule
- Register
- Live

**Header CTA** (not a nav item, always visible): **Give** — styled as a secondary button next to the primary **Register Now** CTA.

**Footer / secondary pages** (real pages, lower nav priority):
- Plan Your Visit *(combines Hotel & Travel + Rules & Etiquette)*
- Gallery
- Contact

Registration is promoted throughout the site, not confined to the nav:
- Persistent high-contrast "Register Now" button in the header on every page
- Large hero CTA on Home
- Sticky mobile bottom bar with a Register button on scroll
- Inline promo banners on About, Schedule, Live, Plan Your Visit, and Gallery pages, dynamically pulling the *next actual pricing-tier deadline* from the registration data (e.g. "Adult rate is $125 through Jan 31 — save $25 before it goes up") so urgency copy never goes stale
- Footer CTA block
- PWA push-notification opt-in for pricing-deadline reminders

## 6. Registration & payments

- **Registrant categories**: Adult (30+), Young Adult (20–29), Child (1–19, free) — matching real current pricing tiers above.
- **Individual registration**: single attendee, category + time-window price auto-selected from today's date.
- **Church/group registration**: one church registers multiple attendees under a single submission and a single payment.
- **Payment**: Stripe Checkout, server-validated line items (price never trusted from the client) — adapted from `cac-salvation-center`'s `app/api/checkout/route.ts` + `app/api/stripe/webhook/route.ts` pattern, targeting a new `registrations` table (analogous to their `orders` table) instead of merch orders.
- **Confirmation**: email receipt on successful payment (via Resend, same as the sister project), including a digital ticket. QR-code check-in is a possible future enhancement, not required for launch.
- **Giving/donations**: a separate `/giving`-equivalent flow (the header "Give" button), also via Stripe, independent of registration.

## 7. Bilingual support (English/Yoruba)

Full language toggle via `next-intl`, with locale-prefixed routing (`/en`, `/yo`). No existing pattern to adapt — `cac-salvation-center`'s `ilorinWords.ts` was investigated and found to be unrelated (English-language prayer text, not Yoruba localization), so this is built from scratch: a translation dictionary per locale, covering all UI copy and page content across the site.

## 8. Admin dashboard

Reuses `cac-salvation-center`'s proven pattern almost verbatim:
- Supabase Auth (email/password) gated by an `admin_profiles` allowlist table, enforced once at a protected route-group layout (`app/admin/(protected)/layout.tsx`) so every admin page inherits protection.
- Sections: **Registrations** (list, search, filter by category/church group, export), **Giving/Payments** overview, **Schedule editor** (days, sessions, minister-placeholder names), **Gallery** upload.
- Leadership, Committee, and Rules & Etiquette content is NOT admin-editable in this phase (see Non-goals) — it's maintained as code content.

## 9. Technical architecture

**Stack**: Next.js (App Router) on Vercel, Supabase (Postgres, Auth, RLS), Stripe (payments), Cloudinary (gallery images), `next-intl` (i18n), Upstash Redis (rate limiting), Resend (transactional email).

**Reused as-is from `cac-salvation-center`:**
- Supabase client split: `lib/supabase/server.ts` (SSR/RLS), `client.ts` (browser), `require-admin.ts` (allowlist gate)
- Admin auth pattern (allowlist table + protected layout)
- Stripe Checkout + webhook pattern, adapted from `orders` to `registrations`
- Add-to-calendar helpers (Google Calendar link + `.ics` download) for schedule sessions and convention dates
- Cloudinary image loader for `next/image`, to avoid Vercel's metered image-transform quota

**Built fresh (no reusable pattern existed in prior projects):**
- Bilingual EN/YO via `next-intl` with locale routing
- Real PWA offline support via `next-pwa`/Serwist (the sister project only has a bare `manifest.ts`, no service worker)
- Supabase schema committed as versioned SQL migrations in this repo from day one (the sister project applied schema by hand via the dashboard — not repeating that for a payments-handling system)
- Countdown-to-fixed-date component (adapted in spirit from the sister project's `useCountdown.ts`, which counts down to a recurring weekly service, not a single date — the timer logic, not the "next service" search logic, carries over)

**Explicit deviations from the sister project's conventions:**
- **Styling**: Tailwind utility classes + CSS-variable brand tokens, rather than the sister project's inline-`style={{}}`-heavy approach — faster to build across a larger bilingual multi-page site, and plays well with the `impeccable` and `emil-design-eng` design skills for the polish pass.
- **Rate limiting**: Upstash Redis (serverless-safe) instead of the sister project's in-memory token bucket, which its own code comments flag as not safe across multiple serverless instances — relevant here given national-event traffic spikes at registration windows.

## 10. Design & polish

The `impeccable` skill (copied into this repo from the `preppa` project's `.claude/skills/`) and the built-in `emil-design-eng` skill guide the visual polish pass: color/contrast, motion, typography, and layout discipline. Design work happens after the implementation plan is approved, not during this spec phase.

## 11. Open items to confirm with organizers before launch

- Exact current-year pricing/deadlines should be re-confirmed against `cacnaconvention.org` closer to launch, in case they've changed since this spec was written.
- Whether the existing WordPress site's registration is formally retired/redirected once this platform goes live, or run in parallel for a transition period.
