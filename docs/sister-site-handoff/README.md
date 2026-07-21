# Sister-site handoff: cacnorthamerica.com

## Why this exists

This repo (the CACNA **Convention** site — one annual event) is narrowing its focus to just the convention itself: schedule, registration, store. Organization-wide and department-level content currently living here is meant to move, conceptually, to the sister site — `cacnorthamerica.com` / `cacnorthamerica.vercel.app` — the regional organization's own site, a **separate codebase** not present in this repo.

Nobody working in this repo has write access to that other project, so this can't be a code change on either side. It's a handoff: everything below is what someone maintaining the sister site needs in order to add, confirm, or fix content there. Nothing in `docs/sister-site-handoff/` changes anything this site currently renders — that's a separate, later pass, informed by the decisions this handoff surfaces.

## How to use this

Five files, one per content area, plus a flat action checklist:

| File | Covers |
|---|---|
| [`01-about-org-content.md`](01-about-org-content.md) | History, Leadership, Worldwide Leadership, Statement of Faith, Committee, Superintendents |
| [`02-department-pages.md`](02-department-pages.md) | The 7 department pages (Youth, Children, Good Women, Ministers' Wives, CACMA, Christian Education, Business Group), split into identity content vs. convention-day schedules |
| [`03-known-sister-site-issues.md`](03-known-sister-site-issues.md) | Content bugs that already exist on cacnorthamerica.com today, independent of anything "moving" |
| [`04-gallery-and-news.md`](04-gallery-and-news.md) | Gallery photo disposition (with an important asset-safety warning) and the one News item with no sister-site home |
| [`checklist.md`](checklist.md) | Every action item above, flattened and grouped by what kind of work it is |

## Disposition tags

Every content section below is tagged with exactly one of these:

- **READY TO COPY** — the text already exists in this repo, verbatim, ready to paste onto the sister site.
- **ALREADY LIVE — CONFIRM ONLY** — this content already exists on cacnorthamerica.com; the only action is a one-time visual check that it's still there and still accurate, not authoring anything new.
- **SISTER-SITE BUG** — the content exists there, but it's wrong.
- **STAYS HERE / DOESN'T MOVE** — this is convention-specific and stays on this site even after it narrows scope. Not a gap.
- **NEEDS OWNER DECISION** — genuinely ambiguous. Don't guess — this handoff surfaces the question instead.

## Top priority

Of everything catalogued, one item is a real, live gap on **both** sites today: the **Statement of Faith** (12 doctrinal items, in `01-about-org-content.md`). It was recovered from a 2016 Wayback Machine snapshot of cacnorthamerica.com and, per that recovery's own source comment, "isn't published anywhere on either live site today." Nothing else in this handoff is as urgent.

## Not covered here

Restructuring *this* site (nav reorder, homepage↔register swap, redesigning the Schedule page around the daily-by-track agenda, removing the 7 department pages and the Gallery/News pages from navigation) was discussed separately and isn't part of this handoff. This handoff only prepares the content those later changes will orphan, so nothing gets lost.
