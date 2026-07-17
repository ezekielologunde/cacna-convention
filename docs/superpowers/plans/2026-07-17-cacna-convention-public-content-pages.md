# CACNA Convention — Public Content Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public content pages (Home, About, Schedule, Plan Your Visit, Archive, Contact) on top of the Foundation plan's shell, reading real content seeded from the 2026 crawl.

**Architecture:** Server Components under `app/(site)/[locale]/...` reading from Supabase (`convention_editions`, a new `schedule_sessions` table) for dynamic content, and static typed TS data files for rarely-changing content (leadership, committee, hotels, rules) per the spec's Non-goals. A shared `FooterNav` component completes the navigation Foundation's `PrimaryNav` started.

**Tech Stack:** Same as Foundation — Next.js App Router, Supabase, next-intl, Vitest + RTL, Tailwind + CSS-variable tokens.

## Global Constraints

- Every page ships in both `en` and `yo` — add matching keys to both `messages/en.json` and `messages/yo.json` in the same commit; the existing `tests/i18n/messages.test.ts` parity test fails otherwise.
- All new public pages live under `app/(site)/[locale]/...` (Foundation's route-group split — the `(site)` root layout owns `<html lang={locale}>`; a page created outside it won't get locale/nav/fonts).
- Leadership, Committee, Rules & Etiquette, and Hotel & Travel content is NOT admin-editable in this phase (design spec §3 Non-goals) — static typed data files, not Supabase tables.
- Schedule IS Supabase-backed (`schedule_sessions`, FK to `convention_editions`) — Plan 5's admin schedule editor needs this data to already live in the database.
- Registration is the dominant CTA site-wide (design spec §5) — Foundation's `PrimaryNav` already carries the persistent "Register Now" header CTA on every page, satisfying that for this plan. The spec's *dynamic* inline promo banners ("Adult rate is $125 through Jan 31 — save $25 before it goes up") need real pricing-tier data that doesn't exist until Plan 3 (Registration & Payments) creates it — building a static version now would mean throwing it away, so it's explicitly deferred to Plan 3, which will add those banners to the pages this plan builds.
- Design tokens remain placeholders (Foundation's `--color-brand` etc.) — do not introduce new hardcoded colors.
- Real content seed values (schedule, hotels, leadership, committee, contacts) come from `docs/source-content/2026-cacnaconvention-org-content.md` — use those values verbatim, they're already verified against the live site.
- Commit after every task.

---

### Task 1: Schedule data model

**Files:**
- Create: `supabase/migrations/0002_schedule_sessions.sql`
- Create: `supabase/migrations/0003_seed_2026_edition.sql`
- Modify: `types/database.types.ts`
- Test: `tests/lib/schedule.test.ts`

**Interfaces:**
- Produces: `schedule_sessions` table (`id, edition_id, day_date, starts_at, ends_at, title, minister_name, minister_title, track, sort_order, created_at`), and `getScheduleForEdition(supabase, editionId): Promise<ScheduleSession[]>` in `lib/schedule.ts` — Task 5 (Schedule page) and Task 7 (Archive page) both call this.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0002_schedule_sessions.sql`:

```sql
create table schedule_sessions (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references convention_editions(id) on delete cascade,
  day_date date not null,
  starts_at time not null,
  ends_at time not null,
  title text not null,
  minister_name text,
  minister_title text,
  track text not null default 'general',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index schedule_sessions_edition_idx on schedule_sessions (edition_id, day_date, starts_at);

alter table schedule_sessions enable row level security;

create policy "schedule_sessions readable by everyone"
  on schedule_sessions for select
  using (true);

create policy "schedule_sessions writable by admins"
  on schedule_sessions for all
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()))
  with check (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));
```

`minister_name`/`minister_title` are nullable — a null pair renders as "Guest Minister" (design spec §3), matching that most 2026 sessions DO have a confirmed minister while future editions may not yet.

- [ ] **Step 2: Seed the 2026 edition and its sessions**

Create `supabase/migrations/0003_seed_2026_edition.sql`. This is the real, already-verified 2026 schedule from `docs/source-content/2026-cacnaconvention-org-content.md`, marked `past` per the design spec's 2027-retargeting (§1) — it's archive content, not live:

```sql
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
```

- [ ] **Step 3: Apply both migrations**

Using the Supabase MCP: call `mcp__claude_ai_Supabase__apply_migration` for each file in order (`0002` then `0003`) against the project provisioned in Foundation (`cqmswuiloehkrrxvtxcz`). Confirm with `mcp__claude_ai_Supabase__list_tables` that `schedule_sessions` exists, and `mcp__claude_ai_Supabase__execute_sql` with `select count(*) from schedule_sessions;` returns 21.

- [ ] **Step 4: Update database types**

Modify `types/database.types.ts` — add a `schedule_sessions` entry to `Tables`, matching the existing style exactly (including `Relationships: []`):

```ts
      schedule_sessions: {
        Row: {
          id: string;
          edition_id: string;
          day_date: string;
          starts_at: string;
          ends_at: string;
          title: string;
          minister_name: string | null;
          minister_title: string | null;
          track: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          day_date: string;
          starts_at: string;
          ends_at: string;
          title: string;
          minister_name?: string | null;
          minister_title?: string | null;
          track?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["schedule_sessions"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 5: Write the failing test**

Create `tests/lib/schedule.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { getScheduleForEdition } from "../../lib/schedule";

describe("getScheduleForEdition", () => {
  it("queries schedule_sessions filtered by edition, ordered by day and sort_order", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ id: "s1", day_date: "2026-07-13", title: "Registration" }],
      error: null,
    });
    const eqMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    const result = await getScheduleForEdition(supabase, "edition-1");

    expect(fromMock).toHaveBeenCalledWith("schedule_sessions");
    expect(eqMock).toHaveBeenCalledWith("edition_id", "edition-1");
    expect(result).toEqual([{ id: "s1", day_date: "2026-07-13", title: "Registration" }]);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `lib/schedule.ts` does not exist.

- [ ] **Step 7: Write the minimal implementation**

Create `lib/schedule.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ScheduleSession = Database["public"]["Tables"]["schedule_sessions"]["Row"];

export async function getScheduleForEdition(
  supabase: SupabaseClient<Database>,
  editionId: string
): Promise<ScheduleSession[]> {
  const { data, error } = await supabase
    .from("schedule_sessions")
    .select("*")
    .eq("edition_id", editionId)
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add supabase/migrations/0002_schedule_sessions.sql supabase/migrations/0003_seed_2026_edition.sql types/database.types.ts lib/schedule.ts tests/lib/schedule.test.ts
git commit -m "Add schedule_sessions table, seed 2026 data, and getScheduleForEdition"
```

---

### Task 2: Static content data files

**Files:**
- Create: `lib/content/leadership.ts`
- Create: `lib/content/committee.ts`
- Create: `lib/content/hotels.ts`
- Create: `lib/content/rules.ts`
- Create: `lib/content/history.ts`
- Test: `tests/lib/content.test.ts`

**Interfaces:**
- Produces: typed arrays consumed by Task 4 (About page: `leadership`, `committee`, `history`) and Task 6 (Plan Your Visit page: `hotels`, `rules`).

- [ ] **Step 1: Write the failing test**

Create `tests/lib/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { leadership } from "../../lib/content/leadership";
import { committee } from "../../lib/content/committee";
import { hotels } from "../../lib/content/hotels";
import { rules } from "../../lib/content/rules";
import { history } from "../../lib/content/history";

describe("static content data", () => {
  it("leadership has 5 named leaders", () => {
    expect(leadership).toHaveLength(5);
    expect(leadership[0]).toHaveProperty("name");
    expect(leadership[0]).toHaveProperty("title");
  });

  it("committee has the 3 named roles", () => {
    expect(committee.map((c) => c.role)).toEqual(["Chairman", "Secretary", "PRO"]);
  });

  it("hotels covers all three cities", () => {
    const cities = new Set(hotels.map((h) => h.city));
    expect(cities).toEqual(new Set(["Chambersburg, PA", "Gettysburg, PA", "Hagerstown, MD"]));
  });

  it("rules is a non-empty list of strings", () => {
    expect(rules.length).toBeGreaterThan(0);
    rules.forEach((r) => expect(typeof r).toBe("string"));
  });

  it("history has founding year 1976", () => {
    expect(history.foundingYear).toBe(1976);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — none of the `lib/content/*` files exist.

- [ ] **Step 3: Write the data files**

Create `lib/content/leadership.ts`:

```ts
export type LeadershipMember = {
  name: string;
  title: string;
};

export const leadership: LeadershipMember[] = [
  {
    name: "Pastor Timothy Agbeja, Ph.D.",
    title: "Latunde Regional Superintendent, CACNA Chairman, CACNA Coordinating Council Chancellor, CACNA Bible Institute Superintendent, Washington DCC",
  },
  {
    name: "Pastor David Adenodi, Ph.D.",
    title: "Chairman, CACNA Convention Member, CACNA Coordinating Council Provost, CACNA Bible Institute Superintendent, V.O.C -USA, DCC",
  },
  {
    name: "Pastor Joseph Olawale",
    title: "Latunde Regional Secretary, CACNA Member, CACNA Coordinating Council Registrar, CACNA Bible Institute Superintendent, Texas DCC",
  },
  {
    name: "Pastor Timothy Adelani",
    title: "Latunde Regional Treasurer, CACNA Member, CACNA Coordinating Council Superintendent, Manhattan NY DCC",
  },
  {
    name: "Pastor John Oluwatimilehin, Ph.D.",
    title: "Chairman, CAC Village Management Council Member, CACNA Coordinating Council Superintendent, Bethel DCC",
  },
];
```

Create `lib/content/committee.ts`:

```ts
export type CommitteeMember = {
  role: "Chairman" | "Secretary" | "PRO";
  name: string;
  organization: string;
  phone: string;
};

export const committee: CommitteeMember[] = [
  { role: "Chairman", name: "David Adenodi", organization: "C.A.C Vineyard of Comfort", phone: "301-440-7033" },
  { role: "Secretary", name: "Pastor Timothy Famojuro", organization: "C.A.C. FITA, Brooklyn, NY", phone: "917-709-1892" },
  { role: "PRO", name: "Pastor Yomi Ademuwagun", organization: "CAC Agape Fellowship MD", phone: "443-583-9416" },
];
```

Create `lib/content/hotels.ts`:

```ts
export type Hotel = {
  name: string;
  city: "Chambersburg, PA" | "Gettysburg, PA" | "Hagerstown, MD";
  phone: string;
  ratePerNight: number;
  bookingNote: string;
};

export const hotels: Hotel[] = [
  { name: "Comfort Inn Greencastle", city: "Chambersburg, PA", phone: "717-798-3578", ratePerNight: 139, bookingNote: "Online booking available" },
  { name: "La Quinta", city: "Chambersburg, PA", phone: "717-446-0770", ratePerNight: 139, bookingNote: "Call hotel directly" },
  { name: "Super 8 By Wyndham I-81", city: "Chambersburg, PA", phone: "717-263-6655", ratePerNight: 75, bookingNote: "Call hotel directly" },
  { name: "Holiday Inn Express", city: "Chambersburg, PA", phone: "717-709-9009", ratePerNight: 141, bookingNote: "Online booking available" },
  { name: "Holiday Inn Express", city: "Gettysburg, PA", phone: "717-420-2686", ratePerNight: 189, bookingNote: "Online booking available" },
  { name: "Sleep Inn & Suites", city: "Gettysburg, PA", phone: "717-398-2670", ratePerNight: 129, bookingNote: "Call hotel directly" },
  { name: "Aspire Hotel", city: "Gettysburg, PA", phone: "717-321-3311", ratePerNight: 139, bookingNote: "Online booking available" },
  { name: "Hampton Inn", city: "Gettysburg, PA", phone: "717-338-9121", ratePerNight: 205, bookingNote: "Call hotel directly" },
  { name: "Eisenhower Hotel & Conference Center", city: "Gettysburg, PA", phone: "717-334-2755", ratePerNight: 139, bookingNote: "Online booking available" },
  { name: "Hampton Inn", city: "Hagerstown, MD", phone: "240-420-1970", ratePerNight: 139, bookingNote: "Online booking available" },
];

export const hotelGroupCode = "Christ Apostolic Church CACNA";
```

Create `lib/content/rules.ts`:

```ts
export const rules: string[] = [
  "Identification (ID tags) must be worn at all times and is required for convention hall entry.",
  "Arrive at least 10 minutes before each session begins.",
  "Maintain clean surroundings throughout the convention.",
  "Food tickets are non-replaceable if lost — keep them secure.",
  "Keep children supervised; avoid lingering in hallways or lobbies.",
  "Follow all directions from the convention committee, ushers, and security personnel.",
  "Dress appropriately, presenting yourselves as vessels unto honor (1 Thess. 4:4).",
  "Let all things be done decently and in order (1 Cor. 14:40).",
];
```

Create `lib/content/history.ts`:

```ts
export const history = {
  foundingYear: 1976,
  founder: "Rev. Goke Oyedeji, Ph.D.",
  foundingLocation: "Brooklyn, New York",
  summary:
    "The first Christ Apostolic Church in North America started as a house fellowship in 1976 by the late Rev. Goke Oyedeji, Ph.D., in Brooklyn, New York. Today CAC North America spans 16 DCCs/Zones across the United States and Canada.",
  zoneCount: 16,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content tests/lib/content.test.ts
git commit -m "Add static content data files (leadership, committee, hotels, rules, history)"
```

---

### Task 3: Footer navigation component

**Files:**
- Create: `components/navigation/FooterNav.tsx`
- Modify: `app/(site)/[locale]/layout.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/FooterNav.test.tsx`

**Interfaces:**
- Consumes: `Nav.planYourVisit`, `Nav.gallery`, `Nav.archive`, `Nav.contact` keys (already present in `messages/*.json` since Foundation Task 5 — verify before use, don't re-add if already there).
- Produces: `FooterNav`, mounted in `app/(site)/[locale]/layout.tsx` below `{children}`.

- [ ] **Step 1: Verify existing message keys**

Read `messages/en.json` and confirm `Nav.planYourVisit`, `Nav.gallery`, `Nav.archive`, `Nav.contact` already exist (added in Foundation Task 5). Do not add duplicates. If any are missing, add them to both `messages/en.json` and `messages/yo.json` now, keeping parity.

- [ ] **Step 2: Write the failing test**

Create `tests/components/FooterNav.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { FooterNav } from "../../components/navigation/FooterNav";
import messages from "../../messages/en.json";

function renderFooter() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <FooterNav />
    </NextIntlClientProvider>
  );
}

describe("FooterNav", () => {
  it("renders the four secondary nav links", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Plan Your Visit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gallery" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Archive" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `components/navigation/FooterNav.tsx` does not exist.

- [ ] **Step 4: Write the minimal implementation**

Create `components/navigation/FooterNav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const FOOTER_ITEMS = [
  { key: "planYourVisit", href: "/plan-your-visit" },
  { key: "gallery", href: "/gallery" },
  { key: "archive", href: "/archive" },
  { key: "contact", href: "/contact" },
] as const;

export function FooterNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] px-6 py-8">
      <ul className="flex flex-wrap items-center gap-6">
        {FOOTER_ITEMS.map((item) => (
          <li key={item.key}>
            <Link href={`/${locale}${item.href}`}>{t(item.key)}</Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Mount in the locale layout**

Modify `app/(site)/[locale]/layout.tsx` — add `import { FooterNav } from "@/components/navigation/FooterNav";` and render `<FooterNav />` after `{children}`, inside the same `NextIntlClientProvider`. Keep the existing `<PrimaryNav />` mount and `setRequestLocale` call unchanged.

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: succeeds, no route changes.

- [ ] **Step 8: Commit**

```bash
git add components/navigation/FooterNav.tsx "app/(site)/[locale]/layout.tsx" messages/en.json messages/yo.json tests/components/FooterNav.test.tsx
git commit -m "Add footer navigation"
```

---

### Task 4: About page

**Files:**
- Create: `app/(site)/[locale]/about/page.tsx`
- Create: `components/about/AboutTabs.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/AboutTabs.test.tsx`

**Interfaces:**
- Consumes: `leadership`, `committee`, `history` from `lib/content/*` (Task 2).
- Produces: `/about` page with three tabbed sections (Our Story, Leadership, Committee) per design spec §5.

- [ ] **Step 1: Add message keys**

Add to both `messages/en.json` and `messages/yo.json` (keep exact parity — same nesting, same key names):

`en.json` — add under a new top-level `About` key:
```json
"About": {
  "ourStory": "Our Story",
  "leadership": "Leadership",
  "committee": "Committee",
  "founded": "Founded in {year} by {founder} in {location}."
}
```

`yo.json`:
```json
"About": {
  "ourStory": "Ìtàn Wa",
  "leadership": "Aṣíwájú",
  "committee": "Ìgbìmọ̀",
  "founded": "A dá sílẹ̀ ní ọdún {year} láti ọwọ́ {founder} ní {location}."
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/components/AboutTabs.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AboutTabs } from "../../components/about/AboutTabs";
import messages from "../../messages/en.json";
import { leadership } from "../../lib/content/leadership";
import { committee } from "../../lib/content/committee";
import { history } from "../../lib/content/history";

describe("AboutTabs", () => {
  it("shows Our Story by default and switches to Leadership on click", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AboutTabs leadership={leadership} committee={committee} history={history} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(history.founder, { exact: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Leadership" }));
    expect(screen.getByText(leadership[0].name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Committee" }));
    expect(screen.getByText(committee[0].name)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `components/about/AboutTabs.tsx` does not exist.

- [ ] **Step 4: Write the minimal implementation**

Create `components/about/AboutTabs.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { LeadershipMember } from "@/lib/content/leadership";
import type { CommitteeMember } from "@/lib/content/committee";
import type { history as History } from "@/lib/content/history";

type Tab = "story" | "leadership" | "committee";

export function AboutTabs({
  leadership,
  committee,
  history,
}: {
  leadership: LeadershipMember[];
  committee: CommitteeMember[];
  history: typeof History;
}) {
  const t = useTranslations("About");
  const [tab, setTab] = useState<Tab>("story");

  const tabs: { id: Tab; label: string }[] = [
    { id: "story", label: t("ourStory") },
    { id: "leadership", label: t("leadership") },
    { id: "committee", label: t("committee") },
  ];

  return (
    <div className="px-6 py-12">
      <div role="tablist" className="flex gap-4 border-b border-[var(--color-border)]">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            role="tab"
            aria-selected={tab === tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className="px-3 py-2"
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "story" ? (
        <p className="mt-6 max-w-2xl">
          {t("founded", {
            year: history.foundingYear,
            founder: history.founder,
            location: history.foundingLocation,
          })}
        </p>
      ) : null}

      {tab === "leadership" ? (
        <ul className="mt-6 flex flex-col gap-4">
          {leadership.map((member) => (
            <li key={member.name}>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-[var(--color-muted)]">{member.title}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "committee" ? (
        <ul className="mt-6 flex flex-col gap-4">
          {committee.map((member) => (
            <li key={member.name}>
              <p className="font-medium">
                {member.name} — {member.role}
              </p>
              <p className="text-sm text-[var(--color-muted)]">{member.organization}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Wire the page**

Create `app/(site)/[locale]/about/page.tsx`:

```tsx
import { setRequestLocale } from "next-intl/server";
import { AboutTabs } from "@/components/about/AboutTabs";
import { leadership } from "@/lib/content/leadership";
import { committee } from "@/lib/content/committee";
import { history } from "@/lib/content/history";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutTabs leadership={leadership} committee={committee} history={history} />;
}
```

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: succeeds; `/en/about` and `/yo/about` both statically prerendered.

- [ ] **Step 8: Commit**

```bash
git add app/(site)/[locale]/about components/about messages/en.json messages/yo.json tests/components/AboutTabs.test.tsx
git commit -m "Add About page with Our Story/Leadership/Committee tabs"
```

---

### Task 5: Schedule page

**Files:**
- Create: `app/(site)/[locale]/schedule/page.tsx`
- Create: `components/schedule/ScheduleDay.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/ScheduleDay.test.tsx`

**Interfaces:**
- Consumes: `getScheduleForEdition` (Task 1), `createClient` from `lib/supabase/server.ts` (Foundation Task 3).

- [ ] **Step 1: Add message keys**

Add to both `messages/en.json` and `messages/yo.json` under a new `Schedule` key:

`en.json`:
```json
"Schedule": {
  "title": "Schedule",
  "guestMinister": "Guest Minister",
  "noEdition": "Schedule details will be posted closer to the convention."
}
```

`yo.json`:
```json
"Schedule": {
  "title": "Iṣètò",
  "guestMinister": "Aṣíwájú Àlejò",
  "noEdition": "A óò fi ìtòlẹ́sẹ̀ payẹ̀wò síta nígbà tí àpéjọ bá súnmọ́."
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/components/ScheduleDay.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ScheduleDay } from "../../components/schedule/ScheduleDay";
import messages from "../../messages/en.json";

describe("ScheduleDay", () => {
  it("renders a session with a named minister", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ScheduleDay
          dayDate="2026-07-14"
          sessions={[
            {
              id: "s1",
              starts_at: "10:00:00",
              ends_at: "11:30:00",
              title: "Ministers' Session 1",
              minister_name: "Pastor T. A. O. Agbeja",
              minister_title: "Regional Supt. Latunde Region",
            },
          ]}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Ministers' Session 1")).toBeInTheDocument();
    expect(screen.getByText("Pastor T. A. O. Agbeja")).toBeInTheDocument();
  });

  it("shows the Guest Minister placeholder when no minister is set", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ScheduleDay
          dayDate="2026-07-13"
          sessions={[
            {
              id: "s2",
              starts_at: "09:00:00",
              ends_at: "10:00:00",
              title: "Opening Session",
              minister_name: null,
              minister_title: null,
            },
          ]}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Guest Minister")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `components/schedule/ScheduleDay.tsx` does not exist.

- [ ] **Step 4: Write the minimal implementation**

Create `components/schedule/ScheduleDay.tsx`:

```tsx
import { useTranslations } from "next-intl";

type SessionSummary = {
  id: string;
  starts_at: string;
  ends_at: string;
  title: string;
  minister_name: string | null;
  minister_title: string | null;
};

export function ScheduleDay({
  dayDate,
  sessions,
}: {
  dayDate: string;
  sessions: SessionSummary[];
}) {
  const t = useTranslations("Schedule");

  return (
    <section className="py-6">
      <h2 className="text-lg font-semibold">{dayDate}</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {sessions.map((session) => (
          <li key={session.id} className="border-b border-[var(--color-border)] pb-4">
            <p className="text-sm text-[var(--color-muted)]">
              {session.starts_at.slice(0, 5)}–{session.ends_at.slice(0, 5)}
            </p>
            <p className="font-medium">{session.title}</p>
            <p className="text-sm text-[var(--color-muted)]">
              {session.minister_name ?? t("guestMinister")}
              {session.minister_title ? ` — ${session.minister_title}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Note: `ScheduleDay` is a Client Component (uses `useTranslations`, a hook) — this is fine since it's rendered as a child of the async `SchedulePage` Server Component below, not itself async.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Wire the page**

Create `app/(site)/[locale]/schedule/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getScheduleForEdition } from "@/lib/schedule";
import { ScheduleDay } from "@/components/schedule/ScheduleDay";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Schedule");

  const supabase = await createClient();
  const { data: edition } = await supabase
    .from("convention_editions")
    .select("id")
    .in("status", ["current", "upcoming"])
    .order("year", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!edition) {
    return (
      <div className="px-6 py-12">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{t("noEdition")}</p>
      </div>
    );
  }

  const sessions = await getScheduleForEdition(supabase, edition.id);
  const byDay = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const existing = byDay.get(session.day_date) ?? [];
    existing.push(session);
    byDay.set(session.day_date, existing);
  }

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      {Array.from(byDay.entries()).map(([dayDate, daySessions]) => (
        <ScheduleDay key={dayDate} dayDate={dayDate} sessions={daySessions} />
      ))}
    </div>
  );
}
```

Note: this queries for `status in ('current','upcoming')`, not `'past'` — since Task 1 seeded the 2026 edition as `status = 'past'`, this page will correctly show the "no edition yet" empty state until a real 2027 `upcoming`/`current` edition is created (via Plan 5's admin Editions feature) — matching design spec §5a ("the live site always queries the upcoming/current edition").

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: succeeds. `/en/schedule` and `/yo/schedule` render the empty state (no `current`/`upcoming` edition exists yet — expected until Plan 5 creates 2027).

- [ ] **Step 8: Commit**

```bash
git add app/(site)/[locale]/schedule components/schedule messages/en.json messages/yo.json tests/components/ScheduleDay.test.tsx
git commit -m "Add Schedule page reading from the current/upcoming edition"
```

---

### Task 6: Plan Your Visit page

**Files:**
- Create: `app/(site)/[locale]/plan-your-visit/page.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/app/plan-your-visit.test.tsx`

**Interfaces:**
- Consumes: `hotels`, `hotelGroupCode`, `rules` from `lib/content/*` (Task 2).

- [ ] **Step 1: Add message keys**

Add to both files under `PlanYourVisit`:

`en.json`:
```json
"PlanYourVisit": {
  "title": "Plan Your Visit",
  "hotelsHeading": "Hotels",
  "rulesHeading": "Rules & Etiquette",
  "groupCode": "Group code: {code}"
}
```

`yo.json`:
```json
"PlanYourVisit": {
  "title": "Ṣe Ètò Ìbẹ̀wò Rẹ",
  "hotelsHeading": "Àwọn Hotẹ́ẹ̀lì",
  "rulesHeading": "Òfin àti Ìwà",
  "groupCode": "Kóòdù ẹgbẹ́: {code}"
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/app/plan-your-visit.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { hotels } from "../../lib/content/hotels";
import { rules } from "../../lib/content/rules";

describe("PlanYourVisitPage", () => {
  it("renders hotel names and rules", async () => {
    const { default: PlanYourVisitPage } = await import(
      "../../app/(site)/[locale]/plan-your-visit/page"
    );
    const Page = await PlanYourVisitPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText(hotels[0].name)).toBeInTheDocument();
    expect(screen.getByText(rules[0])).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — the page module doesn't exist.

- [ ] **Step 4: Write the minimal implementation**

Create `app/(site)/[locale]/plan-your-visit/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hotels, hotelGroupCode } from "@/lib/content/hotels";
import { rules } from "@/lib/content/rules";

export default async function PlanYourVisitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PlanYourVisit");

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>

      <section className="mt-8">
        <h2 className="text-xl font-medium">{t("hotelsHeading")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("groupCode", { code: hotelGroupCode })}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {hotels.map((hotel) => (
            <li key={`${hotel.name}-${hotel.city}`}>
              <p className="font-medium">{hotel.name}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {hotel.city} · {hotel.phone} · ${hotel.ratePerNight}/night · {hotel.bookingNote}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-medium">{t("rulesHeading")}</h2>
        <ul className="mt-4 list-disc pl-5">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: succeeds; `/en/plan-your-visit` and `/yo/plan-your-visit` statically prerendered.

- [ ] **Step 7: Commit**

```bash
git add "app/(site)/[locale]/plan-your-visit" messages/en.json messages/yo.json tests/app/plan-your-visit.test.tsx
git commit -m "Add Plan Your Visit page (hotels + rules & etiquette)"
```

---

### Task 7: Archive page

**Files:**
- Create: `app/(site)/[locale]/archive/page.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/app/archive.test.tsx`

**Interfaces:**
- Consumes: `createClient` (Foundation Task 3), `getScheduleForEdition` (Task 1).

- [ ] **Step 1: Add message keys**

Add under `Archive`:

`en.json`:
```json
"Archive": {
  "title": "Past Conventions",
  "sessionCount": "{count} sessions",
  "empty": "No past conventions yet."
}
```

`yo.json`:
```json
"Archive": {
  "title": "Àwọn Àpéjọ Àtijọ́",
  "sessionCount": "Ìpàdé {count}",
  "empty": "Kò tíì sí àpéjọ àtijọ́ kankan."
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/app/archive.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

describe("ArchivePage", () => {
  it("lists past editions with their theme and year", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ id: "e1", year: 2026, theme: "The Bible: God's Message to Man", starts_on: "2026-07-13", ends_on: "2026-07-18" }],
      error: null,
    });
    const eqMock = vi.fn(() => ({ order: orderMock }));
    createClientMock.mockResolvedValue({
      from: () => ({ select: () => ({ eq: eqMock }) }),
    });

    const { default: ArchivePage } = await import("../../app/(site)/[locale]/archive/page");
    const Page = await ArchivePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("2026", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("The Bible: God's Message to Man")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — the page module doesn't exist.

- [ ] **Step 4: Write the minimal implementation**

Create `app/(site)/[locale]/archive/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Archive");

  const supabase = await createClient();
  const { data: editions } = await supabase
    .from("convention_editions")
    .select("id, year, theme, starts_on, ends_on")
    .eq("status", "past")
    .order("year", { ascending: false });

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>

      {!editions || editions.length === 0 ? (
        <p className="mt-4 text-[var(--color-muted)]">{t("empty")}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {editions.map((edition) => (
            <li key={edition.id} className="border-b border-[var(--color-border)] pb-6">
              <h2 className="text-xl font-medium">{edition.year} — {edition.theme}</h2>
              <p className="text-sm text-[var(--color-muted)]">
                {edition.starts_on} – {edition.ends_on}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: succeeds; `/en/archive` and `/yo/archive` render — the 2026 edition (seeded `past` in Task 1) should appear when checked manually against the real database (not asserted by the mocked unit test, but worth a manual `next start` + curl check).

- [ ] **Step 7: Commit**

```bash
git add "app/(site)/[locale]/archive" messages/en.json messages/yo.json tests/app/archive.test.tsx
git commit -m "Add Archive page listing past convention editions"
```

---

### Task 8: Contact page and Gallery stub

**Files:**
- Create: `app/(site)/[locale]/contact/page.tsx`
- Create: `app/(site)/[locale]/gallery/page.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/app/contact.test.tsx`

**Interfaces:**
- Consumes: `committee` from `lib/content/committee.ts` (Task 2) for contact details (chairman/secretary already carry phone; add email/address inline here since those weren't part of the `CommitteeMember` type — see Step 3).

The Gallery page is a temporary placeholder — the real Cloudinary-backed gallery is a later plan (Plan 6). It exists now only so `FooterNav`'s "Gallery" link (Task 3) doesn't 404.

- [ ] **Step 1: Add message keys**

Add under `Contact` and `Gallery`:

`en.json`:
```json
"Contact": {
  "title": "Contact",
  "generalInquiries": "General inquiries"
},
"Gallery": {
  "title": "Gallery",
  "comingSoon": "Photos from the convention will be posted here."
}
```

`yo.json`:
```json
"Contact": {
  "title": "Kàn Sí Wa",
  "generalInquiries": "Ìbéèrè gbogbogbò"
},
"Gallery": {
  "title": "Àwòrán",
  "comingSoon": "A óò fi àwòrán àpéjọ síta níbí."
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/app/contact.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

describe("ContactPage", () => {
  it("renders the committee chairman's contact details", async () => {
    const { default: ContactPage } = await import("../../app/(site)/[locale]/contact/page");
    const Page = await ContactPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("cacnaconvention@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("301-440-7033")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — the page module doesn't exist.

- [ ] **Step 4: Write the minimal implementation**

Create `app/(site)/[locale]/contact/page.tsx` with the three real contacts from `docs/source-content/2026-cacnaconvention-org-content.md` (these aren't in `lib/content/committee.ts`'s shape, which lacks email/address — inline them here rather than reshaping that file, since Task 2's `CommitteeMember` type is consumed by the About page's committee-roster display and shouldn't grow contact-specific fields it doesn't need there):

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";

const CONTACTS = [
  {
    name: "Pastor David Adenodi",
    role: "Convention Chairman",
    phone: "301-440-7033",
    email: "cacnaconvention@gmail.com",
    org: "C.A.C. Vineyard of Comfort, 6408 Princess Garden Parkway, Lanham, MD 20706",
  },
  {
    name: "Pastor Timothy Famojuro",
    role: "Convention Secretary",
    phone: "917-709-1892",
    email: "ftimothy54@aol.com",
    org: "C.A.C. FITA, Brooklyn, NY",
  },
  {
    name: "Pastor Joseph Olawale",
    role: "General inquiries",
    phone: "305-469-0346",
    email: "cacna@hotmail.com",
    org: "Christ Apostolic Church DFW Metroplex, Sanctuary of Power and Praise, 612 E. 2nd Street, Irving, TX 75060",
  },
];

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <ul className="mt-8 flex flex-col gap-6">
        {CONTACTS.map((contact) => (
          <li key={contact.email}>
            <p className="font-medium">{contact.name} — {contact.role}</p>
            <p className="text-sm text-[var(--color-muted)]">{contact.phone} · {contact.email}</p>
            <p className="text-sm text-[var(--color-muted)]">{contact.org}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Add the Gallery stub**

Create `app/(site)/[locale]/gallery/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Gallery");

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-4 text-[var(--color-muted)]">{t("comingSoon")}</p>
    </div>
  );
}
```

No dedicated test for this page — it's a one-line static placeholder with no logic, fully superseded by Plan 6.

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: succeeds; `/en/contact`, `/yo/contact`, `/en/gallery`, `/yo/gallery` all statically prerendered.

- [ ] **Step 8: Commit**

```bash
git add "app/(site)/[locale]/contact" "app/(site)/[locale]/gallery" messages/en.json messages/yo.json tests/app/contact.test.tsx
git commit -m "Add Contact page and Gallery placeholder"
```

---

### Task 9: Home page real content

**Files:**
- Modify: `app/(site)/[locale]/page.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/app/home.test.tsx`

**Interfaces:**
- Replaces Foundation's placeholder home page with real hero content and quick links to About/Schedule/Register/Live, matching design spec §5's Home description.

- [ ] **Step 1: Update message keys**

Modify `messages/en.json`'s existing `Home` section (added in Foundation Task 5) to add quick-link labels — keep `title`/`subtitle` as-is, add:

```json
"Home": {
  "title": "CACNA Convention",
  "subtitle": "Christ Apostolic Church North America — join us for our national convention.",
  "learnMore": "Learn More",
  "viewSchedule": "View Schedule"
}
```

Mirror in `yo.json`'s existing `Home` section:

```json
"Home": {
  "title": "Àpéjọ CACNA",
  "subtitle": "Ìjọ Aposteli Kristi ní Àríwá Amẹ́ríkà — ẹ dara pọ̀ mọ́ wa fún àpéjọ orílẹ̀-èdè wa.",
  "learnMore": "Kọ́ Ẹ̀kọ́ Síi",
  "viewSchedule": "Wo Ìtòlẹ́sẹ̀"
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/app/home.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

describe("HomePage", () => {
  it("renders quick links to About and Schedule", async () => {
    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "Learn More" })).toHaveAttribute("href", "/en/about");
    expect(screen.getByRole("link", { name: "View Schedule" })).toHaveAttribute("href", "/en/schedule");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — current `page.tsx` has no quick-link buttons yet.

- [ ] **Step 4: Update the implementation**

Modify `app/(site)/[locale]/page.tsx`:

```tsx
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-4 max-w-md text-lg text-[var(--color-muted)]">{t("subtitle")}</p>
      <div className="mt-8 flex gap-4">
        <Link
          href={`/${locale}/about`}
          className="rounded-full border border-[var(--color-border)] px-5 py-2 font-medium"
        >
          {t("learnMore")}
        </Link>
        <Link
          href={`/${locale}/schedule`}
          className="rounded-full border border-[var(--color-border)] px-5 py-2 font-medium"
        >
          {t("viewSchedule")}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: succeeds; `/en` and `/yo` still statically prerendered.

- [ ] **Step 7: Commit**

```bash
git add "app/(site)/[locale]/page.tsx" messages/en.json messages/yo.json tests/app/home.test.tsx
git commit -m "Add real Home page content with quick links"
```

---

## What this plan does not cover

Registration, Giving, the rest of the admin dashboard (registrations, giving overview, schedule editor, gallery upload, editions management), the real Cloudinary gallery, and live streaming — all later plans per the Foundation plan's decomposition. The Schedule and Archive pages built here will show empty/placeholder states until Plan 5 creates a real `upcoming`/`current` 2027 edition.
