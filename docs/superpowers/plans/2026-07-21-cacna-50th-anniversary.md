# CACNA 50th Anniversary Celebration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Celebrate CAC North America's 50th anniversary (Oct 10, 2026) site-wide: a dismissible top banner and a permanent footer badge on every page, plus a hero nod and a dedicated celebratory section on the homepage.

**Architecture:** One new content file (`lib/content/anniversary.ts`) is the single source of truth for the event's facts, consumed by five surfaces: the existing News page entry (refactored to use it), a new client-side dismissible banner mounted in the root layout, a new footer badge, an upgraded hero badge, and a new homepage section. A new `gold` tone is added to the shared `Badge` component. All UI chrome text goes through next-intl (`messages/en.json` + `messages/yo.json`); the event facts themselves stay plain English, matching this project's existing convention for owner-provided content.

**Tech Stack:** Next.js App Router (Server + Client Components), next-intl, Tailwind CSS v4 (CSS variables, no config file), Vitest + Testing Library, no new dependencies.

## Global Constraints

- Gold text (`var(--color-gold)`) is only safe on dark backgrounds (e.g. `var(--gradient-band)`) — never directly on the white page background. Gold **fill** + dark (`#16121a`) text is safe anywhere (already used by the footer's Register button).
- No new animation library or dependency — any motion is plain CSS `@keyframes`, automatically covered by the existing global `prefers-reduced-motion` rule in `app/globals.css` (lines 164–173) — no separate reduced-motion override needed.
- Every new key must be added to **both** `messages/en.json` and `messages/yo.json` with a real Yoruba translation (not a placeholder) — `tests/i18n/messages.test.ts` asserts exact key parity between the two files and will fail otherwise.
- The anniversary's facts (date, location, description, URL) live only in `lib/content/anniversary.ts` and are plain English strings, not run through next-intl — matching every other file in `lib/content/` (e.g. `history.ts`, `news-events.ts`).
- Every external link (`anniversary.moreInfoUrl`) uses `target="_blank" rel="noopener noreferrer"` and an `aria-label` suffixed with that namespace's `opensInNewTab` key — the existing convention used throughout this codebase (e.g. `components/navigation/FooterNav.tsx`'s YouTube link).
- Current `HEAD` is commit `b292a3f` on `main`, working tree clean. Run `npx vitest run` and `npx tsc --noEmit` before starting to confirm this baseline (the only expected failure is pre-existing and unrelated: `tests/lib/supabase-middleware.test.ts`).

---

### Task 1: Anniversary content — single source of truth

**Files:**
- Create: `lib/content/anniversary.ts`
- Modify: `lib/content/news-events.ts`
- Test: `tests/lib/content.test.ts`

**Interfaces:**
- Produces: `anniversary: { years: number; foundingYear: number; date: string; location: string; description: string; moreInfoUrl: string }`, exported from `lib/content/anniversary.ts`. Every later task imports this.

- [ ] **Step 1: Write the failing test**

Add to the bottom of `tests/lib/content.test.ts` (add this import alongside the existing ones at the top of the file: `import { anniversary } from "../../lib/content/anniversary";` and `import { newsEvents } from "../../lib/content/news-events";`):

```ts
  it("anniversary has the 50th-anniversary facts, and the News page's entry matches it exactly", () => {
    expect(anniversary).toMatchObject({
      years: 50,
      foundingYear: 1976,
      date: "2026-10-10",
      location: "CAC Village, USA",
      moreInfoUrl: "https://cacnorthamerica.com/events/cacna-50th-anniversary-2026",
    });

    const newsEntry = newsEvents.find(
      (e) => e.title === "CAC North America 50th Anniversary Celebration"
    )!;
    expect(newsEntry.date).toBe(anniversary.date);
    expect(newsEntry.location).toBe(anniversary.location);
    expect(newsEntry.description).toBe(anniversary.description);
    expect(newsEntry.moreInfoUrl).toBe(anniversary.moreInfoUrl);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/content.test.ts`
Expected: FAIL — `Cannot find module '../../lib/content/anniversary'`

- [ ] **Step 3: Create `lib/content/anniversary.ts`**

```ts
// Single source of truth for CAC North America's 50th Anniversary
// Celebration facts (October 10, 2026, CAC Village, USA) -- consumed by the
// News page (via news-events.ts below), the site-wide announcement banner,
// the footer badge, and the homepage's dedicated anniversary section, so
// every surface agrees and there's exactly one place to update if a detail
// ever changes. English-only (not run through next-intl), matching every
// other owner-provided-fact file in lib/content/ (history.ts, the rest of
// news-events.ts, etc.).
export const anniversary = {
  years: 50,
  foundingYear: 1976,
  date: "2026-10-10",
  location: "CAC Village, USA",
  description:
    "Christ Apostolic Church North America celebrates 50 years since its founding in 1976, at CAC Village — the same grounds that host the annual convention.",
  moreInfoUrl: "https://cacnorthamerica.com/events/cacna-50th-anniversary-2026",
};
```

- [ ] **Step 4: Refactor `lib/content/news-events.ts` to consume it**

Add this import at the top of `lib/content/news-events.ts` (after the existing top-of-file comment, before `export type NewsEvent`):

```ts
import { anniversary } from "@/lib/content/anniversary";
```

Then replace the first entry of the `newsEvents` array — currently:

```ts
  {
    title: "CAC North America 50th Anniversary Celebration",
    date: "2026-10-10",
    location: "CAC Village, USA",
    description:
      "Christ Apostolic Church North America celebrates 50 years since its founding in 1976, at CAC Village — the same grounds that host the annual convention.",
    // A real dedicated page for this now exists on cacnorthamerica.com
    // (built and verified 2026-07-19) — link there directly instead of
    // the generic homepage.
    moreInfoUrl: "https://cacnorthamerica.com/events/cacna-50th-anniversary-2026",
  },
```

with:

```ts
  {
    title: "CAC North America 50th Anniversary Celebration",
    date: anniversary.date,
    location: anniversary.location,
    description: anniversary.description,
    // A real dedicated page for this now exists on cacnorthamerica.com
    // (built and verified 2026-07-19) — link there directly instead of
    // the generic homepage.
    moreInfoUrl: anniversary.moreInfoUrl,
  },
```

(The `title` stays a News-page-specific string — it's page framing, not a shared fact. Leave every other entry in the array untouched.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/lib/content.test.ts tests/app/news.test.tsx`
Expected: PASS (all tests, including the pre-existing News page tests, which read `newsEvents[0]`'s fields dynamically and must still see the identical values)

- [ ] **Step 6: Commit**

```bash
git add lib/content/anniversary.ts lib/content/news-events.ts tests/lib/content.test.ts
git commit -m "Add lib/content/anniversary.ts as the single source of truth for the 50th anniversary facts"
```

---

### Task 2: `Badge` gold tone

**Files:**
- Modify: `components/ui/Badge.tsx`
- Test: `tests/components/Badge.test.tsx` (new file)

**Interfaces:**
- Consumes: nothing new.
- Produces: `Badge`'s `tone` prop now accepts `"gold"` in addition to `"neutral" | "red" | "blue"`. Task 5 (hero badge) depends on this.

- [ ] **Step 1: Write the failing test**

Create `tests/components/Badge.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../../components/ui/Badge";

describe("Badge", () => {
  it("renders the gold tone as a gold fill with dark text", () => {
    render(<Badge tone="gold">50 Years</Badge>);
    const badge = screen.getByText("50 Years");
    expect(badge.className).toContain("bg-[var(--color-gold)]");
    expect(badge.className).toContain("text-[#16121a]");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/Badge.test.tsx`
Expected: FAIL — TypeScript error, `"gold"` is not assignable to `Badge`'s `tone` prop (or a runtime failure if TS errors are non-blocking in the test runner — either way, the `gold` class won't be present).

- [ ] **Step 3: Add the `gold` tone**

In `components/ui/Badge.tsx`, change:

```ts
  tone?: "neutral" | "red" | "blue";
  className?: string;
}) {
  const toneClass = {
    neutral: "bg-[var(--color-surface)] text-[var(--color-muted)]",
    red: "bg-[var(--color-red-light)] text-[var(--color-red-text)]",
    blue: "bg-[var(--color-blue-light)] text-[var(--color-blue-text)]",
  }[tone];
```

to:

```ts
  tone?: "neutral" | "red" | "blue" | "gold";
  className?: string;
}) {
  const toneClass = {
    neutral: "bg-[var(--color-surface)] text-[var(--color-muted)]",
    red: "bg-[var(--color-red-light)] text-[var(--color-red-text)]",
    blue: "bg-[var(--color-blue-light)] text-[var(--color-blue-text)]",
    // Gold fill + dark text -- the only safe way to use gold as a
    // background, per app/globals.css's --color-gold comment (gold text is
    // reserved for dark surfaces only). Same pairing FooterNav.tsx's
    // Register button already uses.
    gold: "bg-[var(--color-gold)] text-[#16121a]",
  }[tone];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/Badge.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/Badge.tsx tests/components/Badge.test.tsx
git commit -m "Add a gold tone to Badge for the 50th anniversary treatment"
```

---

### Task 3: Site-wide dismissible announcement banner

**Files:**
- Create: `components/ui/AnniversaryBanner.tsx`
- Modify: `app/(site)/[locale]/layout.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/AnniversaryBanner.test.tsx` (new file)

**Interfaces:**
- Consumes: `anniversary` from `lib/content/anniversary.ts` (Task 1).
- Produces: `AnniversaryBanner` — a self-contained client component with no props, safe to render unconditionally in the root layout.

- [ ] **Step 1: Add translations**

In `messages/en.json`, add a new top-level `"Anniversary"` key. Insert it directly after the closing `},` of the `"Footer"` block (before `"Home": {`):

```json
  "Anniversary": {
    "bannerText": "Celebrating 50 Years of CAC North America",
    "bannerCta": "See event details",
    "dismissLabel": "Dismiss the 50th anniversary announcement",
    "opensInNewTab": " (opens in a new tab)"
  },
```

In `messages/yo.json`, in the same position (directly after `"Footer"`, before `"Home"`):

```json
  "Anniversary": {
    "bannerText": "A ń Ṣe Ayẹyẹ Ọdún Àádọ́ta CAC North America",
    "bannerCta": "Wo àwọn kúlẹ̀kúlẹ̀",
    "dismissLabel": "Pa ìkéde ayẹyẹ ọdún àádọ́ta yìí",
    "opensInNewTab": " (yóò ṣí ní táàbù tuntun)"
  },
```

- [ ] **Step 2: Run the i18n parity test to verify it still passes**

Run: `npx vitest run tests/i18n/messages.test.ts`
Expected: PASS (both files gained the same four keys under the same namespace)

- [ ] **Step 3: Write the failing component test**

Create `tests/components/AnniversaryBanner.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { anniversary } from "../../lib/content/anniversary";
import { AnniversaryBanner } from "../../components/ui/AnniversaryBanner";

const STORAGE_KEY = "cacna-anniversary-banner-dismissed";

function renderBanner() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AnniversaryBanner />
    </NextIntlClientProvider>
  );
}

describe("AnniversaryBanner", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("renders a link out to the anniversary event page", async () => {
    renderBanner();
    const link = await screen.findByRole("link", { name: messages.Anniversary.bannerCta });
    expect(link).toHaveAttribute("href", anniversary.moreInfoUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("dismisses on close and remembers the dismissal in sessionStorage", async () => {
    renderBanner();
    const closeButton = await screen.findByRole("button", { name: messages.Anniversary.dismissLabel });
    fireEvent.click(closeButton);

    expect(screen.queryByRole("link", { name: messages.Anniversary.bannerCta })).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe("1");
  });

  it("stays hidden on a fresh mount when the session already dismissed it", async () => {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    renderBanner();

    // Give the mount effect a tick to run, then assert nothing rendered.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tests/components/AnniversaryBanner.test.tsx`
Expected: FAIL — `Cannot find module '../../components/ui/AnniversaryBanner'`

- [ ] **Step 5: Create `components/ui/AnniversaryBanner.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { anniversary } from "@/lib/content/anniversary";

const STORAGE_KEY = "cacna-anniversary-banner-dismissed";

/**
 * Site-wide, session-dismissible announcement for CAC North America's 50th
 * Anniversary Celebration. Mounted once in the root layout, above the nav,
 * so it shows on every page. Dark band (`--gradient-band`, same tone as the
 * Watch section/footer) rather than the red `--gradient-cta` PromoBanner
 * uses -- keeps the two visually distinct, and gold text is only safe on a
 * dark background (see app/globals.css's --color-gold comment).
 *
 * Dismissing writes to sessionStorage (not localStorage) so the banner
 * reappears on the next visit/new browser session rather than being
 * dismissed forever.
 */
export function AnniversaryBanner() {
  const t = useTranslations("Anniversary");
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(window.sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  // null = not yet mounted (avoid a flash before we know the stored state);
  // true = the visitor already dismissed it this session.
  if (dismissed === null || dismissed) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3 px-6 py-3 text-center text-sm font-semibold text-white sm:justify-between sm:text-left"
      style={{ background: "var(--gradient-band)" }}
    >
      <p>
        <span className="text-[var(--color-gold)]">{t("bannerText")}</span>{" "}
        <a
          href={anniversary.moreInfoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("bannerCta")}${t("opensInNewTab")}`}
          className="underline underline-offset-2 hover:text-[var(--color-gold)]"
        >
          {t("bannerCta")}
        </a>
      </p>
      <button
        type="button"
        aria-label={t("dismissLabel")}
        onClick={() => {
          window.sessionStorage.setItem(STORAGE_KEY, "1");
          setDismissed(true);
        }}
        className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={16} strokeWidth={2.25} aria-hidden="true" />
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/components/AnniversaryBanner.test.tsx`
Expected: PASS

- [ ] **Step 7: Mount it in the root layout**

In `app/(site)/[locale]/layout.tsx`, add the import alongside the other component imports:

```tsx
import { AnniversaryBanner } from "@/components/ui/AnniversaryBanner";
```

Then add `<AnniversaryBanner />` directly above `<PrimaryNav />`:

```tsx
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[var(--color-fg)] focus:shadow-lg"
          >
            {t("skipToContent")}
          </a>
          <AnniversaryBanner />
          <PrimaryNav />
```

- [ ] **Step 8: Run the full test suite to check for regressions**

Run: `npx vitest run`
Expected: PASS (aside from the pre-existing, unrelated `tests/lib/supabase-middleware.test.ts` failure noted in Global Constraints)

- [ ] **Step 9: Commit**

```bash
git add components/ui/AnniversaryBanner.tsx app/\(site\)/\[locale\]/layout.tsx messages/en.json messages/yo.json tests/components/AnniversaryBanner.test.tsx
git commit -m "Add a site-wide, session-dismissible 50th anniversary announcement banner"
```

---

### Task 4: Permanent footer badge

**Files:**
- Modify: `components/navigation/FooterNav.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/FooterNav.test.tsx`

**Interfaces:**
- Consumes: `anniversary` from `lib/content/anniversary.ts` (Task 1).

- [ ] **Step 1: Add the translation key**

In `messages/en.json`, add `"anniversaryBadge"` to the existing `"Footer"` block (anywhere among its other keys, e.g. right after `"subscribeRss"`):

```json
    "subscribeRss": "Subscribe via RSS",
    "anniversaryBadge": "50th Anniversary · 1976–2026",
    "backToTop": "Back to top"
```

In `messages/yo.json`, the same position in `"Footer"`:

```json
    "subscribeRss": "Forúkọsílẹ̀ nípasẹ̀ RSS",
    "anniversaryBadge": "Ayẹyẹ Ọdún Àádọ́ta · 1976–2026",
    "backToTop": "Padà sí Òkè"
```

- [ ] **Step 2: Run the i18n parity test**

Run: `npx vitest run tests/i18n/messages.test.ts`
Expected: PASS

- [ ] **Step 3: Write the failing test**

Add this import to the top of `tests/components/FooterNav.test.tsx`:

```tsx
import { anniversary } from "../../lib/content/anniversary";
```

Then add a new test in the `describe("FooterNav", ...)` block:

```tsx
  it("renders a 50th anniversary badge linking to the event page", async () => {
    await renderFooter();
    const badge = screen.getByRole("link", { name: /50th Anniversary/ });
    expect(badge).toHaveAttribute("href", anniversary.moreInfoUrl);
    expect(badge).toHaveAttribute("target", "_blank");
  });
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tests/components/FooterNav.test.tsx`
Expected: FAIL — no link with that accessible name exists yet

- [ ] **Step 5: Add the badge to `FooterNav.tsx`**

Add the import at the top of `components/navigation/FooterNav.tsx`, alongside the other content imports:

```tsx
import { anniversary } from "@/lib/content/anniversary";
```

Then, in the brand column, add the badge directly after the existing button row. Find this (the end of the Register/YouTube/RSS button row, followed by the brand column's closing `</div>`):

```tsx
              <a
                href="/feed.xml"
                aria-label={tFooter("subscribeRss")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-white/40 hover:text-white"
              >
                <Rss size={18} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
          </div>
```

and change it to:

```tsx
              <a
                href="/feed.xml"
                aria-label={tFooter("subscribeRss")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-white/40 hover:text-white"
              >
                <Rss size={18} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
            <a
              href={anniversary.moreInfoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${tFooter("anniversaryBadge")}${tFooter("opensInNewTab")}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-gold)]/40 px-3 py-1 text-xs font-bold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)]"
            >
              {tFooter("anniversaryBadge")}
            </a>
          </div>
```

(Only one of the two `</div>` lines after the RSS link's `</a>` moves — the button row's own closing `</div>` stays where it is; the badge is added as a new sibling before the brand column's outer `</div>`, which is the one that shifts down by five lines.)

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/components/FooterNav.test.tsx`
Expected: PASS (all tests in the file, including the new one)

- [ ] **Step 7: Commit**

```bash
git add components/navigation/FooterNav.tsx messages/en.json messages/yo.json tests/components/FooterNav.test.tsx
git commit -m "Add a permanent 50th anniversary badge to the footer"
```

---

### Task 5: Homepage hero badge upgrade

**Files:**
- Modify: `app/(site)/[locale]/page.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/app/home.test.tsx`

**Interfaces:**
- Consumes: `Badge`'s new `"gold"` tone (Task 2).

- [ ] **Step 1: Update the translation copy**

In `messages/en.json`'s `"Home"` block, change:

```json
    "establishedBadge": "Est. {year}",
```

to:

```json
    "establishedBadge": "Celebrating 50 Years · Est. {year}",
```

In `messages/yo.json`'s `"Home"` block, change:

```json
    "establishedBadge": "Ìdásílẹ̀ {year}",
```

to:

```json
    "establishedBadge": "Ń Ṣe Ayẹyẹ Ọdún Àádọ́ta · Ìdásílẹ̀ {year}",
```

- [ ] **Step 2: Run the i18n parity test**

Run: `npx vitest run tests/i18n/messages.test.ts`
Expected: PASS (existing key, value changed in both files — key set is unchanged)

- [ ] **Step 3: Write the failing test**

Add this test to the `describe("HomePage", ...)` block in `tests/app/home.test.tsx` (place it near the other hero-related tests):

```tsx
  it("upgrades the hero's established badge to a gold 50th-anniversary badge", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    const badge = screen.getByText(`Celebrating 50 Years · Est. ${history.foundingYear}`);
    expect(badge.className).toContain("bg-[var(--color-gold)]");
  });
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tests/app/home.test.tsx -t "gold 50th-anniversary badge"`
Expected: FAIL — the badge's className doesn't contain `bg-[var(--color-gold)]` yet (it's still `tone="red"`)

- [ ] **Step 5: Change the badge's tone in `page.tsx`**

Change:

```tsx
              <div className="mt-8 flex justify-center lg:justify-start">
                <Badge tone="red">{t("establishedBadge", { year: history.foundingYear })}</Badge>
              </div>
```

to:

```tsx
              <div className="mt-8 flex justify-center lg:justify-start">
                <Badge tone="gold">{t("establishedBadge", { year: history.foundingYear })}</Badge>
              </div>
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/app/home.test.tsx`
Expected: PASS (all tests in the file)

- [ ] **Step 7: Commit**

```bash
git add "app/(site)/[locale]/page.tsx" messages/en.json messages/yo.json tests/app/home.test.tsx
git commit -m "Upgrade the homepage hero badge to a gold 50th-anniversary callout"
```

---

### Task 6: Dedicated homepage anniversary section

**Files:**
- Create: `components/home/AnniversarySection.tsx`
- Modify: `app/(site)/[locale]/page.tsx`
- Modify: `app/globals.css`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/app/home.test.tsx`

**Interfaces:**
- Consumes: `anniversary` from `lib/content/anniversary.ts` (Task 1); the `formatDate` function already defined in `page.tsx` (`(dateStr: string) => string`, short month/day/year in UTC — see existing code at `app/(site)/[locale]/page.tsx` around line 100).
- Produces: `AnniversarySection({ formatDate }: { formatDate: (dateStr: string) => string }): Promise<JSX.Element>` — an async Server Component, called and awaited the same way `WatchSection`/`PhotoMarquee` already are in `page.tsx` (resolved to a variable before the returned JSX, not rendered as `<AnniversarySection />` directly — nesting a second async Server Component inside the returned tree breaks `tests/app/home.test.tsx`'s manual `await HomePage(...)` render pattern, per the existing comment in `page.tsx`).

- [ ] **Step 1: Add translations**

In `messages/en.json`'s `"Home"` block, add three new keys (e.g. right after `"marqueeHeading"`, the last key in that block):

```json
    "marqueeHeading": "Moments from convention week.",
    "anniversaryHeading": "Celebrating 50 Years of CAC North America",
    "anniversaryCta": "See Anniversary Details",
    "opensInNewTab": " (opens in a new tab)"
```

In `messages/yo.json`'s `"Home"` block, the same position:

```json
    "marqueeHeading": "Àwọn àkókò láti ọ̀sẹ̀ àpéjọ.",
    "anniversaryHeading": "A ń Ṣe Ayẹyẹ Ọdún Àádọ́ta CAC North America",
    "anniversaryCta": "Wo Àlàyé Ayẹyẹ Náà",
    "opensInNewTab": " (yóò ṣí ní táàbù tuntun)"
```

- [ ] **Step 2: Run the i18n parity test**

Run: `npx vitest run tests/i18n/messages.test.ts`
Expected: PASS

- [ ] **Step 3: Add the sparkle-float keyframes**

In `app/globals.css`, add this directly after the `scroll-indicator-line` rule (the last rule in the file):

```css

/* Decorative confetti-dot float for the homepage's 50th-anniversary
 * section -- the global reduced-motion block above already zeroes this
 * out, so no separate override is needed here (same treatment as
 * hero-kenburns). Rotation is read from a per-dot CSS custom property
 * (set inline by AnniversarySection) so the keyframe's `transform` doesn't
 * clobber each dot's individual static rotation. */
@keyframes sparkle-float {
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(0) rotate(var(--sparkle-rotate, 0deg));
  }
  50% {
    opacity: 0.9;
    transform: translateY(-8px) rotate(var(--sparkle-rotate, 0deg));
  }
}
.sparkle-float {
  animation: sparkle-float 3.6s ease-in-out infinite;
}
```

- [ ] **Step 4: Write the failing test**

Add this import to the top of `tests/app/home.test.tsx`:

```tsx
import { anniversary } from "../../lib/content/anniversary";
```

Then add a new test in the `describe("HomePage", ...)` block:

```tsx
  it("renders the 50th anniversary section with the date, location, and a link to the event page", async () => {
    mockEditionQueries();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByRole("heading", { name: "Celebrating 50 Years of CAC North America" })
    ).toBeInTheDocument();
    expect(screen.getByText("Oct 10, 2026 · CAC Village, USA")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /See Anniversary Details/ });
    expect(link).toHaveAttribute("href", anniversary.moreInfoUrl);
    expect(link).toHaveAttribute("target", "_blank");
  });
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run tests/app/home.test.tsx -t "50th anniversary section"`
Expected: FAIL — no such heading/text/link exists yet

- [ ] **Step 6: Create `components/home/AnniversarySection.tsx`**

```tsx
import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { anniversary } from "@/lib/content/anniversary";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

// Decorative confetti-dot positions/rotations are fixed, not randomized --
// Math.random() would differ between the server render and the client
// hydration pass and trip a hydration mismatch. Purely aria-hidden
// decoration, no semantic meaning.
const CONFETTI_DOTS = [
  { top: "12%", left: "8%", size: 10, rotate: -18, tone: "gold", delayMs: 0 },
  { top: "22%", left: "88%", size: 8, rotate: 25, tone: "white", delayMs: 400 },
  { top: "68%", left: "5%", size: 7, rotate: 40, tone: "white", delayMs: 800 },
  { top: "78%", left: "92%", size: 11, rotate: -10, tone: "gold", delayMs: 1200 },
  { top: "40%", left: "50%", size: 6, rotate: 15, tone: "white", delayMs: 1600 },
  { top: "10%", left: "45%", size: 9, rotate: -30, tone: "gold", delayMs: 2000 },
] as const;

/**
 * The homepage's "big celebration" moment for CAC North America's 50th
 * anniversary -- a dark band (matching the Watch section's `--gradient-band`,
 * so gold text is safe here) with a large gold "50" numeral, the event's
 * facts, and a link out to cacnorthamerica.com's dedicated event page.
 *
 * An async Server Component (translations only, no data fetch) -- called
 * and awaited in page.tsx ahead of the returned JSX, the same way
 * WatchSection/PhotoMarquee already are, not rendered as a JSX element
 * directly (see the comment on that pattern in page.tsx).
 */
export async function AnniversarySection({
  formatDate,
}: {
  formatDate: (dateStr: string) => string;
}) {
  const t = await getTranslations("Home");

  return (
    <section className="relative overflow-hidden px-6 py-16 sm:py-20" style={{ background: "var(--gradient-band)" }}>
      {CONFETTI_DOTS.map((dot, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="sparkle-float pointer-events-none absolute rounded-sm"
          style={
            {
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              background: dot.tone === "gold" ? "var(--color-gold)" : "rgba(255,255,255,0.3)",
              animationDelay: `${dot.delayMs}ms`,
              "--sparkle-rotate": `${dot.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="font-display text-[5rem] leading-none text-[var(--color-gold)] sm:text-[7rem]">
            {anniversary.years}
          </span>
          <h2 className="mt-2 font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t("anniversaryHeading")}
          </h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-white/80">{anniversary.description}</p>
          <p className="mt-4 text-xs font-bold tracking-[0.2em] text-[var(--color-gold)] uppercase">
            {formatDate(anniversary.date)} · {anniversary.location}
          </p>
          <div className="mt-8">
            <Button
              href={anniversary.moreInfoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("anniversaryCta")}${t("opensInNewTab")}`}
            >
              {t("anniversaryCta")}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Wire it into `page.tsx`**

Add the import alongside the other `components/home/*` imports:

```tsx
import { AnniversarySection } from "@/components/home/AnniversarySection";
```

Resolve it ahead of the returned JSX, alongside `watchSection`/`photoMarquee` (find this existing block and add the new line after it):

```tsx
  const watchSection = await WatchSection({ locale });
  const photoMarquee = await PhotoMarquee();
  const anniversarySection = await AnniversarySection({ formatDate });
```

Render it directly after the hero `</section>` and before the Welcome band's `{/* Welcome ... */}` comment:

```tsx
        </a>
      </section>

      {anniversarySection}

      {/* Welcome — two-column on desktop: gradient panel + message card */}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/app/home.test.tsx`
Expected: PASS (all tests in the file)

- [ ] **Step 9: Commit**

```bash
git add components/home/AnniversarySection.tsx "app/(site)/[locale]/page.tsx" app/globals.css messages/en.json messages/yo.json tests/app/home.test.tsx
git commit -m "Add a dedicated 50th anniversary section to the homepage"
```

---

### Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: PASS, aside from the single pre-existing, unrelated failure in `tests/lib/supabase-middleware.test.ts` (confirmed present on `HEAD` before this plan started — see Global Constraints).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors beyond the same pre-existing `tests/lib/supabase-middleware.test.ts` errors present before this plan started.

- [ ] **Step 3: Lint the new/changed files**

Run:

```bash
npx eslint lib/content/anniversary.ts lib/content/news-events.ts components/ui/Badge.tsx components/ui/AnniversaryBanner.tsx components/navigation/FooterNav.tsx components/home/AnniversarySection.tsx "app/(site)/[locale]/page.tsx" "app/(site)/[locale]/layout.tsx" app/globals.css
```

Expected: No output (clean).

- [ ] **Step 4: Live browser check**

Start the dev server preview and check:
1. On any non-homepage page (e.g. `/en/news`), the gold-accented dark announcement banner appears above the nav; clicking its × hides it; reloading the same tab keeps it hidden (same session); opening the page in a fresh tab/session shows it again.
2. The footer's brand column shows the "50th Anniversary · 1976–2026" badge, linking out to `https://cacnorthamerica.com/events/cacna-50th-anniversary-2026` in a new tab.
3. On the homepage (`/en`), the hero's badge now reads "Celebrating 50 Years · Est. 1976" in gold.
4. Directly below the hero, the new dark anniversary section renders: large gold "50", heading, description, "Oct 10, 2026 · CAC Village, USA", a working CTA button, and the confetti dots gently floating (or motionless if the OS is set to reduce motion).
5. Check both `/en` and `/yo` render without missing-translation errors, and check both light and dark site themes (via the theme toggle) for contrast issues on the new gold text/badges.

No code changes expected in this step unless an issue is found — if one is, fix it, re-run the affected test file, and commit the fix separately before continuing.
