# Homepage Redesign + Content Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring real source content (welcome message, mission statement, registration guidelines, full rules & etiquette) into the homepage, About page, Register page, and Plan Your Visit page, replacing thin/placeholder copy.

**Architecture:** Pure content + UI additions within the existing Next.js 16 App Router / next-intl / Tailwind v4 structure. No new routes, no schema changes. Long-form real content goes into new English-only `lib/content/*.ts` files (matching every existing content file in this codebase); short UI chrome (headings, button labels) goes into `messages/en.json` + `messages/yo.json` with real Yoruba translations.

**Tech Stack:** Next.js 16 (App Router, Server Components), next-intl, Tailwind v4, Vitest + Testing Library.

## Global Constraints

- Every new English message key needs a real Yoruba translation in the same task — `tests/i18n/messages.test.ts` fails the whole suite on any key mismatch between `messages/en.json` and `messages/yo.json`.
- Long-form real content (paragraphs, bullet lists sourced from cacnaconvention.org) goes into `lib/content/*.ts` as plain English exports — it is never wrapped in `t()`. Only short UI chrome (section headings, button/link labels) uses `useTranslations`/`getTranslations`.
- No fabricated 2027 dates. The database has no 2027 `convention_editions` row yet (only one row: `2026`, `status = 'past'`) — the homepage kicker shows year + location only, never specific days.
- Match existing visual tokens exactly: `var(--color-fg)`, `var(--color-muted)`, `var(--color-maroon)`, `var(--color-border)`, `var(--color-surface)`, `font-display` for headings. Do not introduce new colors or fonts.
- Run `npm test` and `npm run build` after every task; both must pass before committing.

---

### Task 1: Homepage kicker + Welcome section

**Files:**
- Create: `lib/content/welcome.ts`
- Modify: `messages/en.json`, `messages/yo.json`
- Modify: `app/(site)/[locale]/page.tsx`
- Test: `tests/app/home.test.tsx`

**Interfaces:**
- Produces: `welcomeMessage: { paragraphs: string[]; closingLead: string }` exported from `lib/content/welcome.ts`, consumed by `app/(site)/[locale]/page.tsx`.

- [ ] **Step 1: Create the welcome message content file**

Create `lib/content/welcome.ts`:

```ts
// Sourced verbatim from cacnaconvention.org's homepage welcome message
// (see docs/source-content/2026-cacnaconvention-org-content.md for
// provenance). The closing "contact us" reference is rendered as a real
// link to this site's own Contact page by the consuming component, not
// stored here as text.

export const welcomeMessage = {
  paragraphs: [
    "Calvary greetings in the name of our Lord and Savior Jesus Christ, of whose precious blood we are all redeemed. The Lord God Almighty, your Creator, is requesting that we all walk in Unity with our brethren of whom you have the same Father and to grow in every area of Life and Ministry in the work He has given to us to do for the Glory of His name.",
    "People of God, the Lord is calling us to prepare ourselves for the Kingdom of God, building ourselves up in knowledge and wisdom, and showing ourselves approved of Him so that when people see and hear of our works, His name will be Praised. We are therefore calling out to every member and friend of Christ Apostolic Church, North America to make themselves available for the Upcoming programs that are being made available through this Convention. Be a part taker in what God is doing and let's partake of it diligently, doing it well. Let us do all things in the spirit of excellence as is expected by God from us that we may please Him.",
  ],
  closingLead:
    "Please go on through the site and get all the information you need to register, or feel free to",
};
```

- [ ] **Step 2: Add the new translation keys**

In `messages/en.json`, inside the `"Home"` object, replace:

```json
    "title": "CACNA Convention",
    "subtitle": "Christ Apostolic Church North America Convention",
```

with:

```json
    "title": "CACNA Convention",
    "subtitle": "Christ Apostolic Church North America Convention",
    "kicker": "2027 · CAC Village, USA",
    "welcomeHeading": "Welcome to CACNA Convention",
    "contactLinkText": "contact us",
```

In `messages/yo.json`, inside the `"Home"` object, replace:

```json
    "title": "Àpéjọ CACNA",
    "subtitle": "Àpéjọ Ìjọ Aposteli Kristi ní Àríwá Amẹ́ríkà",
```

with:

```json
    "title": "Àpéjọ CACNA",
    "subtitle": "Àpéjọ Ìjọ Aposteli Kristi ní Àríwá Amẹ́ríkà",
    "kicker": "2027 · Abúlé CAC, USA",
    "welcomeHeading": "Kaabọ̀ sí Àpéjọ CACNA",
    "contactLinkText": "kàn sí wa",
```

- [ ] **Step 3: Write the failing test**

In `tests/app/home.test.tsx`, add this import near the top (alongside the existing imports):

```tsx
import { welcomeMessage } from "../../lib/content/welcome";
```

Add a new `it` block inside the existing `describe("HomePage", ...)` block, after the last existing test:

```tsx
  it("renders the kicker and welcome message", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("2027 · CAC Village, USA")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome to CACNA Convention" })).toBeInTheDocument();
    expect(screen.getByText(welcomeMessage.paragraphs[0])).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/en/contact");
  });
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run tests/app/home.test.tsx --exclude "**/.claude/**"`
Expected: FAIL — the new test can't find the kicker text, "Welcome to CACNA Convention" heading, or the "contact us" link, since none exist yet.

- [ ] **Step 5: Add the kicker and Welcome section to the homepage**

In `app/(site)/[locale]/page.tsx`, add this import alongside the existing ones:

```tsx
import { welcomeMessage } from "@/lib/content/welcome";
```

Inside the hero section, replace:

```tsx
        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            {t("title")}
          </h1>
```

with:

```tsx
        <div className="relative mx-auto max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-[var(--color-gold-light)] uppercase">
            {t("kicker")}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            {t("title")}
          </h1>
```

Then, directly after the closing `</section>` of the hero and before the `{/* Mission / what a CACNA week looks like */}` comment, insert a new Welcome section:

```tsx
      {/* Welcome */}
      <section className="px-6 py-16" style={{ background: "var(--color-surface)" }}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl">
            {t("welcomeHeading")}
          </h2>
          {welcomeMessage.paragraphs.map((paragraph, index) => (
            <p key={index} className="mt-4 text-[var(--color-muted)]">
              {paragraph}
            </p>
          ))}
          <p className="mt-4 text-[var(--color-muted)]">
            {welcomeMessage.closingLead}{" "}
            <Link
              href={`/${locale}/contact`}
              className="font-semibold text-[var(--color-maroon)] underline"
            >
              {t("contactLinkText")}
            </Link>
            .
          </p>
        </div>
      </section>

```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run tests/app/home.test.tsx --exclude "**/.claude/**"`
Expected: PASS (all tests in the file, including the pre-existing ones)

- [ ] **Step 7: Run the full suite and the i18n parity test**

Run: `npx vitest run --exclude "**/.claude/**"`
Expected: all files pass, including `tests/i18n/messages.test.ts`

- [ ] **Step 8: Commit**

```bash
git add lib/content/welcome.ts messages/en.json messages/yo.json "app/(site)/[locale]/page.tsx" tests/app/home.test.tsx
git commit -m "Add homepage kicker and Welcome to CACNA Convention section"
```

---

### Task 2: Homepage Gallery CTA

**Files:**
- Modify: `messages/en.json`, `messages/yo.json`
- Modify: `app/(site)/[locale]/page.tsx`
- Test: `tests/app/home.test.tsx`

**Interfaces:**
- Consumes: nothing new from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the new translation keys**

In `messages/en.json`, inside `"Home"`, after `"missionBody"` add:

```json
    "galleryHeading": "See highlights from our last convention",
    "galleryCta": "View Gallery",
```

In `messages/yo.json`, inside `"Home"`, after `"missionBody"` add:

```json
    "galleryHeading": "Wo àwòrán láti àpéjọ tí ó kọjá",
    "galleryCta": "Wo Àwòrán",
```

- [ ] **Step 2: Write the failing test**

In `tests/app/home.test.tsx`, add a new `it` block after the one from Task 1:

```tsx
  it("renders a Gallery CTA linking to the gallery page", async () => {
    mockNoActiveEdition();

    const { default: HomePage } = await import("../../app/(site)/[locale]/page");
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("link", { name: "View Gallery" })).toHaveAttribute("href", "/en/gallery");
  });
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run tests/app/home.test.tsx --exclude "**/.claude/**"`
Expected: FAIL — no "View Gallery" link exists yet.

- [ ] **Step 4: Add the Gallery CTA section**

In `app/(site)/[locale]/page.tsx`, directly after the closing `</section>` of the mission section (the one with `{t("missionHeading")}`) and before the `{/* Registration */}` comment, insert:

```tsx
      {/* Gallery teaser */}
      <section className="px-6 pb-16 text-center">
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("galleryHeading")}</h2>
        <Link
          href={`/${locale}/gallery`}
          className="mt-4 inline-block rounded-full border border-[var(--color-border)] px-6 py-3 font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-maroon)]"
        >
          {t("galleryCta")}
        </Link>
      </section>

```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/app/home.test.tsx --exclude "**/.claude/**"`
Expected: PASS

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run --exclude "**/.claude/**"`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add messages/en.json messages/yo.json "app/(site)/[locale]/page.tsx" tests/app/home.test.tsx
git commit -m "Add homepage Gallery CTA"
```

---

### Task 3: About page — mission statement + Biblically Based / Kingdom Focused

**Files:**
- Create: `lib/content/about-convention.ts`
- Modify: `messages/en.json`, `messages/yo.json`
- Modify: `components/about/AboutTabs.tsx`
- Modify: `app/(site)/[locale]/about/page.tsx`
- Test: `tests/components/AboutTabs.test.tsx`

**Interfaces:**
- Produces: `aboutConvention: { missionStatement: string; biblicallyBased: string[]; kingdomFocused: string[] }` and `type AboutConvention = typeof aboutConvention`, exported from `lib/content/about-convention.ts`.
- `AboutTabs` gains a new required prop `aboutConvention: AboutConvention`, consumed by `app/(site)/[locale]/about/page.tsx` and by the test.

- [ ] **Step 1: Create the about-convention content file**

Create `lib/content/about-convention.ts`:

```ts
// Sourced verbatim from cacnaconvention.org's "About CACNA Convention"
// page (see docs/source-content/2026-cacnaconvention-org-content.md for
// provenance). The source page's closing "People of God, the Lord is
// calling us..." paragraph is intentionally not included here -- it's
// the same text used verbatim in the homepage's Welcome section
// (lib/content/welcome.ts), so it only needs to exist once.

export const aboutConvention = {
  missionStatement:
    "The CACNA Convention exists to facilitate, extend and enlarge the Great Commission of Christ under the umbrella of Christ Apostolic Church North America. This is achieved through the authority of God's inerrant Word to the glory of God the Father, under the Lordship of Jesus Christ, and by the empowerment of the Holy Spirit.",
  biblicallyBased: [
    "Affirmation of a minimal set of doctrinal beliefs.",
    "Biblical inerrancy is the foundational element.",
    "Churches working together in mutual accountability.",
  ],
  kingdomFocused: [
    "A focus on evangelism and church administration.",
    "Networking and having fellowship with each other for growth and progress.",
    "Striving to resource the needs of CACNA churches rather than to direct their ministries.",
    "Utilizing the resources of the CACNA to maximize the ministry effectiveness of CACNA Ministers.",
  ],
};

export type AboutConvention = typeof aboutConvention;
```

- [ ] **Step 2: Add the new translation keys**

In `messages/en.json`, inside `"About"`, after `"superintendents": "Superintendents",` add:

```json
    "missionHeading": "Our Mission",
    "biblicallyBasedHeading": "Biblically Based",
    "kingdomFocusedHeading": "Kingdom Focused",
```

In `messages/yo.json`, inside `"About"`, after `"superintendents": "Àwọn Alábòójútó",` add:

```json
    "missionHeading": "Ète Wa",
    "biblicallyBasedHeading": "Tí Ó Dá Lórí Bíbélì",
    "kingdomFocusedHeading": "Tí Ó Kọ́ Sí Ìjọba Ọlọ́run",
```

- [ ] **Step 3: Write the failing test**

In `tests/components/AboutTabs.test.tsx`, add this import alongside the existing ones:

```tsx
import { aboutConvention } from "../../lib/content/about-convention";
```

Update the `render(...)` call to pass the new prop:

```tsx
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AboutTabs
          leadership={leadership}
          committee={committee}
          superintendents={superintendents}
          aboutConvention={aboutConvention}
          history={history}
        />
      </NextIntlClientProvider>
    );
```

Add new assertions directly after the existing `expect(screen.getByText(history.founder, { exact: false })).toBeInTheDocument();` line, still before the "Leadership" tab click:

```tsx
    expect(screen.getByText(aboutConvention.missionStatement)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Biblically Based" })).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.biblicallyBased[0])).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kingdom Focused" })).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.kingdomFocused[0])).toBeInTheDocument();
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run tests/components/AboutTabs.test.tsx --exclude "**/.claude/**"`
Expected: FAIL — `AboutTabs` doesn't accept an `aboutConvention` prop yet and renders none of this content (TypeScript error on the missing prop, or the assertions fail to find the text).

- [ ] **Step 5: Update AboutTabs to accept and render the new content**

In `components/about/AboutTabs.tsx`, add this import alongside the existing ones:

```tsx
import type { AboutConvention } from "@/lib/content/about-convention";
```

Update the component signature — replace:

```tsx
export function AboutTabs({
  leadership,
  committee,
  superintendents,
  history,
}: {
  leadership: LeadershipMember[];
  committee: CommitteeMember[];
  superintendents: Superintendent[];
  history: typeof History;
}) {
```

with:

```tsx
export function AboutTabs({
  leadership,
  committee,
  superintendents,
  aboutConvention,
  history,
}: {
  leadership: LeadershipMember[];
  committee: CommitteeMember[];
  superintendents: Superintendent[];
  aboutConvention: AboutConvention;
  history: typeof History;
}) {
```

Inside the `"story"` tabpanel, replace:

```tsx
          <p className="mt-4 text-[var(--color-muted)]">
            {t("todayReach", { count: history.zoneCount })}
          </p>
        </div>
      ) : null}
```

with:

```tsx
          <p className="mt-4 text-[var(--color-muted)]">
            {t("todayReach", { count: history.zoneCount })}
          </p>

          <h3 className="mt-6 font-display text-lg text-[var(--color-fg)]">
            {t("missionHeading")}
          </h3>
          <p className="mt-2 text-[var(--color-muted)]">{aboutConvention.missionStatement}</p>

          <h3 className="mt-6 text-sm font-bold tracking-wide text-[var(--color-maroon)] uppercase">
            {t("biblicallyBasedHeading")}
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-[var(--color-muted)]">
            {aboutConvention.biblicallyBased.map((point) => (
              <li key={point} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                  style={{ background: "var(--color-maroon)" }}
                />
                {point}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-bold tracking-wide text-[var(--color-maroon)] uppercase">
            {t("kingdomFocusedHeading")}
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-[var(--color-muted)]">
            {aboutConvention.kingdomFocused.map((point) => (
              <li key={point} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                  style={{ background: "var(--color-maroon)" }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
```

- [ ] **Step 6: Pass the new prop from the About page**

In `app/(site)/[locale]/about/page.tsx`, add this import alongside the existing ones:

```tsx
import { aboutConvention } from "@/lib/content/about-convention";
```

Replace:

```tsx
      <AboutTabs
        leadership={leadership}
        committee={committee}
        superintendents={superintendents}
        history={history}
      />
```

with:

```tsx
      <AboutTabs
        leadership={leadership}
        committee={committee}
        superintendents={superintendents}
        aboutConvention={aboutConvention}
        history={history}
      />
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run tests/components/AboutTabs.test.tsx --exclude "**/.claude/**"`
Expected: PASS

- [ ] **Step 8: Run the full suite**

Run: `npx vitest run --exclude "**/.claude/**"`
Expected: all pass

- [ ] **Step 9: Commit**

```bash
git add lib/content/about-convention.ts messages/en.json messages/yo.json components/about/AboutTabs.tsx "app/(site)/[locale]/about/page.tsx" tests/components/AboutTabs.test.tsx
git commit -m "Add mission statement and Biblically Based/Kingdom Focused pillars to About > Our Story"
```

---

### Task 4: Registration Guidelines on the Register page

**Files:**
- Create: `lib/content/registration-guidelines.ts`
- Modify: `messages/en.json`, `messages/yo.json`
- Modify: `app/(site)/[locale]/register/page.tsx`
- Test: `tests/app/register.test.tsx` (new file)

**Interfaces:**
- Produces: `registrationGuidelines: { items: string[]; freeFoodNote: string }` exported from `lib/content/registration-guidelines.ts`.

- [ ] **Step 1: Create the registration guidelines content file**

Create `lib/content/registration-guidelines.ts`:

```ts
// Sourced verbatim from cacnaconvention.org's homepage "Registration
// Guidelines" section (see docs/source-content/2026-cacnaconvention-org-content.md
// for provenance).

export const registrationGuidelines = {
  items: [
    "All registrations must be done online.",
    "Couples can register together.",
    "All children and youth must be registered separately under Youth and Child registration.",
    "All registration fees include participation and needed conference items and package.",
    "Registration does not cover hotel accommodation — participants should book hotel accommodation personally online.",
  ],
  freeFoodNote: "Food during convention is free for all age groups.",
};
```

- [ ] **Step 2: Add the new translation key**

In `messages/en.json`, inside `"Register"`, after `"title": "Register",` add:

```json
    "guidelinesHeading": "Registration Guidelines",
```

In `messages/yo.json`, inside `"Register"`, after `"title": "Forúkọsílẹ̀",` add:

```json
    "guidelinesHeading": "Àwọn Ìtọ́nisọ́nà Ìforúkọsílẹ̀",
```

- [ ] **Step 3: Write the failing test**

Create `tests/app/register.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { registrationGuidelines } from "../../lib/content/registration-guidelines";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

function mockNoActiveEdition() {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  createClientMock.mockResolvedValue({
    from: () => ({ select: () => ({ in: inMock }) }),
  });
}

describe("RegisterPage", () => {
  it("renders the Registration Guidelines even when registration isn't open yet", async () => {
    mockNoActiveEdition();

    const { default: RegisterPage } = await import("../../app/(site)/[locale]/register/page");
    const Page = await RegisterPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Registration Guidelines" })).toBeInTheDocument();
    expect(screen.getByText(registrationGuidelines.items[0])).toBeInTheDocument();
    expect(screen.getByText(registrationGuidelines.freeFoodNote)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run tests/app/register.test.tsx --exclude "**/.claude/**"`
Expected: FAIL — no "Registration Guidelines" heading exists yet.

- [ ] **Step 5: Add the guidelines section to the Register page**

Replace the full contents of `app/(site)/[locale]/register/page.tsx` with:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { RegisterPageClient } from "@/components/register/RegisterPageClient";
import { registrationGuidelines } from "@/lib/content/registration-guidelines";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Register");

  const supabase = await createClient();
  const edition = await getActiveEdition(supabase);

  return (
    <div>
      {!edition ? (
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-4 max-w-[48ch] text-[var(--color-muted)]">{t("notOpenYet")}</p>
        </div>
      ) : (
        <RegisterPageClient />
      )}

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="font-display text-lg text-[var(--color-fg)]">{t("guidelinesHeading")}</h2>
        <ol className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-muted)]">
          {registrationGuidelines.items.map((item, index) => (
            <li key={item} className="flex gap-2.5">
              <span className="font-semibold text-[var(--color-maroon)] tabular-nums">
                {index + 1}.
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm font-semibold text-[var(--color-maroon)]">
          {registrationGuidelines.freeFoodNote}
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run tests/app/register.test.tsx --exclude "**/.claude/**"`
Expected: PASS

- [ ] **Step 7: Run the full suite**

Run: `npx vitest run --exclude "**/.claude/**"`
Expected: all pass

- [ ] **Step 8: Commit**

```bash
git add lib/content/registration-guidelines.ts messages/en.json messages/yo.json "app/(site)/[locale]/register/page.tsx" tests/app/register.test.tsx
git commit -m "Add Registration Guidelines to the Register page"
```

---

### Task 5: Full Rules & Etiquette transcription

**Files:**
- Modify: `lib/content/rules.ts` (restructured, breaking change to its exported shape)
- Modify: `messages/en.json`, `messages/yo.json`
- Modify: `app/(site)/[locale]/plan-your-visit/page.tsx`
- Test: `tests/app/plan-your-visit.test.tsx`

**Interfaces:**
- Changes `rules` from `string[]` to `{ remember: string[]; rules: string[]; attribution: { name: string; title: string } }`. This is a breaking shape change — the one existing consumer (`app/(site)/[locale]/plan-your-visit/page.tsx`) and the one existing test (`tests/app/plan-your-visit.test.tsx`) both need updating in this task.

- [ ] **Step 1: Write the failing test**

In `tests/app/plan-your-visit.test.tsx`, replace:

```tsx
    expect(screen.getByText(hotels[0].name)).toBeInTheDocument();
    expect(screen.getByText(rules[0])).toBeInTheDocument();
  });
});
```

with:

```tsx
    expect(screen.getByText(hotels[0].name)).toBeInTheDocument();
    expect(screen.getByText(rules.remember[0])).toBeInTheDocument();
    expect(screen.getByText(rules.rules[0])).toBeInTheDocument();
    expect(screen.getByText(rules.attribution.name)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/app/plan-your-visit.test.tsx --exclude "**/.claude/**"`
Expected: FAIL (TypeScript error — `rules` is still `string[]`, has no `.remember`/`.rules`/`.attribution`)

- [ ] **Step 3: Restructure the rules content file**

Replace the full contents of `lib/content/rules.ts` with:

```ts
// Sourced verbatim from the printed convention program, page 31
// ("Convention and Conference Rules & Etiquette") -- see
// docs/source-content/2026-cacnaconvention-org-content.md for
// provenance. Supersedes the earlier, shorter paraphrase that used to
// live here.

export const rules = {
  remember: [
    'Remember that God is not the author of confusion. Everything that we do must be done in an orderly manner. We expect you to exhibit good and Godly behavior and manner throughout your stay at the convention. "Let all things be done decently and in order" (1 Cor. 14:40)',
    'As Christ Ambassador, we should be a good example to the world so that they begin to view us as Christians indeed! Please conduct yourself in your hotel, the Convention hall, the CAC Village and the environment in a manner that glorifies God. "That ye may be blameless and harmless, the sons of God, without rebuke, in the midst of a crooked and perverse nation, among whom ye shine as lights in the world" (Phil. 2:15).',
    "Do not hang around your hotel hallway and lobby and ensure you keep your children and young ones in check.",
    "Please minimize noise in your hotel hallway and in your room.",
    "Please don't do any kind of cooking in your hotel room.",
    "Ensure you dress properly, and let us present ourselves as vessels unto honor (1 Thess. 4:4; Heb. 12:14-17).",
    'Watch your language. Unnecessary and ungodly chatter should be avoided at all cost. "Suffer not thy mouth to cause thy flesh to sin, wherefore should God be angry at thy voice, and destroy the work of thy hands" (Ecc. 5:6; 5:3-4).',
    "Be obedient to and follow the directions given to you by the convention committee, ushers, protocol, security personnel, hospitality, marketing, medical, and registration at all times.",
    "Make sure you take notes of the teaching in each session and go over it afterwards.",
    "Have respect for other attendees and leaders.",
    "Take time to fellowship with other brothers and sisters, and forge new relationships that will be of great benefit to you. Surround yourself with joyful and positive people — joy is contagious.",
    'While everything has been planned to run smoothly, if there is anything that may not go as expected, please kindly let us know your concern in a respectable manner. "Do everything without complaining or arguing" (Phil. 2:14).',
  ],
  rules: [
    "Ensure that your identification tag is always on throughout the duration of the convention. You will not be allowed in the Convention Hall without your tag.",
    "Ensure that you arrive at each event at least ten (10) minutes before the commencement of each session.",
    "Ensure that your surroundings are kept clean throughout the duration of the convention.",
    "Ensure that you park your car properly.",
    "Ensure that you don't park your car around the youth and young adults, children department, and kitchen areas.",
    "No eating in any of the halls.",
    "Don't take the pack of water to your hotel room.",
    "Don't put any sanitary paper or diapers in the toilet, and keep the toilet clean at all times.",
    "Don't litter the Village surrounding.",
    "All trash must be put in a trash can or dumpster.",
    "There shall be a series of prayer sessions, particularly every morning, organized by the prayer department throughout this convention that will touch every area of your life, ministry, marriage, career, and business, etc.",
  ],
  attribution: {
    name: "Pastor David Olusegun Adenodi, Ph.D.",
    title: "Chairman, CACNA Conventions & Conferences",
  },
};
```

- [ ] **Step 4: Add the new translation keys**

In `messages/en.json`, inside `"PlanYourVisit"`, replace:

```json
    "rulesHeading": "Rules & Etiquette",
```

with:

```json
    "rulesHeading": "Rules & Etiquette",
    "rememberHeading": "Remember",
    "rulesListHeading": "Rules",
```

In `messages/yo.json`, inside `"PlanYourVisit"`, replace:

```json
    "rulesHeading": "Òfin àti Ìwà",
```

with:

```json
    "rulesHeading": "Òfin àti Ìwà",
    "rememberHeading": "Rántí",
    "rulesListHeading": "Àwọn Òfin",
```

- [ ] **Step 5: Update the Plan Your Visit page to render the new shape**

In `app/(site)/[locale]/plan-your-visit/page.tsx`, find the Rules & Etiquette section:

```tsx
        <section className="mt-10">
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("rulesHeading")}</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {rules.map((rule) => (
              <li key={rule} className="flex gap-2.5 text-sm text-[var(--color-fg)]">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                  style={{ background: "var(--color-maroon)" }}
                />
                {rule}
              </li>
            ))}
          </ul>
        </section>
```

Replace it with:

```tsx
        <section className="mt-10">
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("rulesHeading")}</h2>

          <h3 className="mt-4 text-sm font-bold tracking-wide text-[var(--color-maroon)] uppercase">
            {t("rememberHeading")}
          </h3>
          <ul className="mt-2 flex flex-col gap-2.5">
            {rules.remember.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-[var(--color-fg)]">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                  style={{ background: "var(--color-maroon)" }}
                />
                {item}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-bold tracking-wide text-[var(--color-maroon)] uppercase">
            {t("rulesListHeading")}
          </h3>
          <ul className="mt-2 flex flex-col gap-2.5">
            {rules.rules.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-[var(--color-fg)]">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                  style={{ background: "var(--color-maroon)" }}
                />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-fg)]">{rules.attribution.name}</span>
            <br />
            {rules.attribution.title}
          </p>
        </section>
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run tests/app/plan-your-visit.test.tsx --exclude "**/.claude/**"`
Expected: PASS

- [ ] **Step 7: Run the full suite**

Run: `npx vitest run --exclude "**/.claude/**"`
Expected: all pass

- [ ] **Step 8: Commit**

```bash
git add lib/content/rules.ts messages/en.json messages/yo.json "app/(site)/[locale]/plan-your-visit/page.tsx" tests/app/plan-your-visit.test.tsx
git commit -m "Replace abbreviated Rules & Etiquette list with the full printed-program transcription"
```

---

### Task 6: Update provenance docs and final verification

**Files:**
- Modify: `docs/source-content/2026-cacnaconvention-org-content.md`

**Interfaces:** none (documentation only).

- [ ] **Step 1: Add provenance entries**

In `docs/source-content/2026-cacnaconvention-org-content.md`, add a new section near the end (before the final "Not brought over" paragraph, or as its own new section) documenting:

```markdown
## Homepage welcome message, About mission/pillars, Registration Guidelines, full Rules & Etiquette (2026-07-17)

Four additional pieces of real content brought over this pass, all verified against the live site directly:

- **Homepage welcome message** — the "Calvary greetings..." / "People of God..." paragraphs from the source homepage, now `lib/content/welcome.ts`, rendered as a new "Welcome to CACNA Convention" section.
- **About CACNA Convention mission + pillars** — the source site's dedicated `/cacna-convention/` page (distinct from the org's founding-history content already on the About page), now `lib/content/about-convention.ts`, appended to the About page's "Our Story" tab.
- **Registration Guidelines** — the 5-item list + "food is free" note from the source homepage, now `lib/content/registration-guidelines.ts`, rendered on the Register page below the form.
- **Full Rules & Etiquette** — superseded the earlier 8-item paraphrase with the complete transcription from the printed convention program's dedicated Rules & Etiquette page (page 31): 12 "Remember" items + 11 "Rules" items + chairman attribution, now the restructured `lib/content/rules.ts`.

The source homepage's date/location banner and "Registration Guidelines" heading are written for the 2026 convention (per this doc's existing "2026 convention is already underway" note) — the homepage kicker adapts this to `2027 · CAC Village, USA` (year + location only, no fabricated specific dates, since no 2027 `convention_editions` row exists yet).
```

- [ ] **Step 2: Run the full test suite one more time**

Run: `npm test`
Expected: all test files pass (should be 33+ files, 90+ tests including the additions from Tasks 1-5)

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: build succeeds, no TypeScript errors, all routes listed in the output including `/[locale]`, `/[locale]/about`, `/[locale]/register`, `/[locale]/plan-your-visit`

- [ ] **Step 4: Commit the docs update**

```bash
git add docs/source-content/2026-cacnaconvention-org-content.md
git commit -m "Document provenance for welcome message, About mission/pillars, Registration Guidelines, and full Rules & Etiquette"
```

- [ ] **Step 5: Push and verify live**

```bash
git push origin main
```

Then, following the pattern established earlier this session: poll production (`https://cacna-convention.vercel.app`) until the new deployment is `READY` (check via the Vercel MCP `list_deployments`/`get_deployment` tools, not `curl` alone — edge caching has produced false positives/negatives earlier in this session). Once ready, verify via browser DOM inspection (not screenshots, which were unreliable this session):

- `/en` — kicker text, "Welcome to CACNA Convention" heading + both paragraphs, "View Gallery" link
- `/en/about` — "Our Story" tab shows the mission statement, "Biblically Based", and "Kingdom Focused" headings with their points
- `/en/register` — "Registration Guidelines" heading + 5 numbered items + free-food note, visible even with no active edition
- `/en/plan-your-visit` — "Remember" and "Rules" sub-headings each with their full item lists, plus the chairman attribution
- Repeat spot-checks on `/yo/...` equivalents to confirm the translated UI chrome (headings) renders correctly in Yoruba while the long-form content stays in English by design

---

## Self-Review Notes

- **Spec coverage:** all 5 goals from the spec are covered — Task 1+2 (homepage), Task 3 (About), Task 4 (Register), Task 5 (Rules & Etiquette), Task 6 (docs + verification).
- **Placeholder scan:** no TBD/TODO markers; every code block is complete, copy-pasteable content, not a description of what to write.
- **Type consistency:** `rules` shape (`{ remember, rules, attribution }`) is used identically in Task 5's content file, page, and test. `AboutConvention` type and `aboutConvention` prop name are used identically across Task 3's content file, component, page, and test.
- **Scope check:** each task produces an independently testable, independently committable deliverable; Tasks 1-5 have no dependencies on each other (only Task 6 depends on all five being done, for the final verification pass).
