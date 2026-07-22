# Gallery and News

## Gallery — **READY TO COPY** (owner decided 2026-07-21: move to sister site), with a non-negotiable asset-safety rule

Source: `lib/content/gallery.ts`. 61 photos total, sourced from cacnaconvention.org's 2025 Convention Gallery and 2025 Children's Department albums:

- `mainGalleryPhotos` — 41 photos, `public/photos/gallery/`
- `childrenGalleryPhotos` — 20 photos, `public/photos/gallery-children/`

No captions or categories exist for any of them anywhere — the filenames are raw WhatsApp-export names, and the removed Gallery page's alt text ("Photo 3 of 41 from the 2025 CACNA Convention") was generated generically at render time, not stored per photo.

**Action:** build a gallery/event-recap page on cacnorthamerica.com using these 61 photos (copy the files there — see the warning below). This Convention site's own `/gallery` page and nav/footer links to it have been removed as of 2026-07-21 (the browsable-gallery *feature*, not the image files — see below).

> ⚠️ **The image files themselves must never be deleted from this repo, regardless of the above.** `mainGalleryPhotos` isn't just former-Gallery-page content — it's imported and reused as hero/strip background imagery on roughly 20 other pages sitewide, including all 7 department pages, `about`, `store`, `live`, `give`, `news`, `schedule`, `archive`, `contact`, `plan-your-visit`, `register`, and the homepage's Anniversary section. Removing the Gallery *page* did not touch `public/photos/gallery/`, `public/photos/gallery-children/`, or `lib/content/gallery.ts` — only `app/(site)/[locale]/gallery/page.tsx` and links pointing at it. If you're continuing this handoff, *copy* the files to the sister site; don't move/delete the originals here.

## News

### Already live on cacnorthamerica.com — **no action needed**

Three of this site's News-page feeds are already pulled live, in real time, from cacnorthamerica.com's own separate Supabase database (`lib/cacnorth-content.ts` / `lib/cacnorth-supabase.ts`) — `cac_world_news`, `blog_posts`, and `events`. These need **zero handoff work**; they already live there. Called out explicitly here so nobody re-does this as if it were a gap.

### Locally authored on this site

Two of the three locally-authored news items in `lib/content/news-events.ts` already link out to the sister site — **ALREADY LIVE — CONFIRM ONLY**:

- "CAC North America 50th Anniversary Celebration" → `https://cacnorthamerica.com/events/cacna-50th-anniversary-2026`
- "2027 Ministers Retreat" → `https://cacnorthamerica.com/events/ministers-retreat-2027`

The third has no sister-site home at all — **READY TO COPY**:

> **Convention Chairman Concludes Two-Decade Tenure** (Jul 13–18, 2026, CAC Village, USA)
>
> In his welcome address at the 2026 convention, Pastor David Adenodi, Ph.D. announced the completion of his tenure as Chairman of Conventions and Conferences after serving since 2000: "I have fought a good fight, I have finished my course, I have kept the faith" (2 Timothy 4:7).

`upcomingConventionDates` (2027–2030 save-the-date ranges) is convention-specific and stays with whatever replaces this site's News/Schedule function — it isn't sister-site content.
