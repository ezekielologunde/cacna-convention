# Brand Alignment Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Convention site's fonts, nav polish, and footer with the sibling `cacnorthamerica.vercel.app` rebuild's visual language, add a real footer newsletter signup, and tighten copy in a couple of identifiably verbose sections.

**Architecture:** A sitewide font-variable swap (no downstream changes needed, since every consumer already reads `--font-heading`/`--font-body`), two small nav/footer visual tweaks sharing one new CSS gradient token, a self-contained newsletter feature (new Supabase table → API route → form component, following this project's existing register-route conventions exactly), and a couple of targeted copy edits.

**Tech Stack:** Next.js App Router, next-intl, Supabase (Postgres + `@supabase/supabase-js` service client), Tailwind CSS v4 (CSS variables), Vitest + Testing Library.

## Global Constraints

- Every new translation key must exist in **both** `messages/en.json` and `messages/yo.json` with real Yoruba (not a placeholder) — `tests/i18n/messages.test.ts` enforces exact key parity.
- No new dependency — the newsletter form uses a hidden honeypot field, not Turnstile/CAPTCHA (this project has no local CAPTCHA-verification route; the one existing Turnstile use, on login, delegates verification to Supabase Auth itself, which a plain email-capture form has no equivalent for).
- The font swap must keep the `--font-heading`/`--font-body` CSS variable names unchanged, since `app/globals.css` and both root layouts already reference them by name.
- Gold (`var(--color-gold)`) text/fill only pairs with dark (`#16121a`) text when used as a fill, or with a dark background when used as text — never gold text directly on the white page background (see `app/globals.css`'s `--color-gold` comment).
- Current `HEAD` is commit `17be3c7` on `main`, clean working tree (verified via `git status`/`git diff --stat HEAD` immediately before writing this plan).
- Content-density edits only touch this project's own written UI copy — never verbatim-sourced quotes/messages (e.g. `lib/content/welcome.ts`'s welcome message, `lib/content/rules.ts`'s transcribed rules), which are direct transcriptions from real source material, not paraphrased summaries.

---

### Task 1: Font swap

**Files:**
- Modify: `lib/fonts.ts`

**Interfaces:**
- Produces: `displayFont`/`bodyFont` exports unchanged in shape (both still `NextFont` objects with a `.variable` property named `--font-heading`/`--font-body` respectively) — every consumer (`app/globals.css`, `app/(site)/[locale]/layout.tsx`, `app/(admin)/layout.tsx`) needs no changes.

- [ ] **Step 1: Replace the font imports and definitions**

In `lib/fonts.ts`, replace the entire file with:

```ts
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

// Shared across both root layouts (app/(site)/[locale]/layout.tsx and
// app/(admin)/layout.tsx) so the font loader calls aren't duplicated
// verbatim between the two multiple-root-layouts trees.
//
// Matches the sibling cacnorthamerica.vercel.app rebuild's own font stack
// exactly (confirmed via getComputedStyle on its live site, 2026-07-21):
// Bricolage Grotesque for headings, Plus Jakarta Sans for body. Both
// fonts' glyph sets were checked directly on fonts.google.com/specimen/.../glyphs
// and confirmed to include the precomposed Yoruba dot-below vowels (ẹ, ọ --
// U+1EB9, U+1ECD) this site's Yoruba content needs, plus the broader
// combining-diacritic coverage Vietnamese's tone-mark system exercises
// (which is why the "vietnamese" subset is what carries this coverage in
// Google Fonts' bucketing, not "latin-ext").
export const displayFont = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
});

export const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});
```

- [ ] **Step 2: Verify the build accepts both font subsets**

Run: `npx next build`
Expected: Build succeeds. `next/font/google` validates the `subsets` array against Google's font metadata at build time — if `"vietnamese"` were an invalid subset key for either family, this step would fail immediately with a clear error naming the invalid subset. (If it does fail, drop `"vietnamese"` from whichever family's array is invalid and re-run — Yoruba rendering would then fall back to that family's `"latin"`-only coverage, which is a smaller regression than a broken build; flag this in the commit message if it happens.)

- [ ] **Step 3: Run the full test suite**

Run: `npx vitest run`
Expected: PASS (fonts aren't asserted on directly in any test; this just confirms nothing else broke).

- [ ] **Step 4: Commit**

```bash
git add lib/fonts.ts
git commit -m "Swap sitewide fonts to Bricolage Grotesque + Plus Jakarta Sans, matching the sibling site"
```

---

### Task 2: Nav/footer visual polish — circular logo, red→gold CTA gradient, arrow suffix

**Files:**
- Modify: `app/globals.css`
- Modify: `components/navigation/PrimaryNav.tsx`
- Modify: `components/navigation/FooterNav.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Modify: `tests/components/PrimaryNav.test.tsx`

**Interfaces:**
- Produces: new CSS token `--gradient-cta-gold`, consumed only by the nav's Register button in this task (not a change to `Button`'s shared `primary` variant).

- [ ] **Step 1: Add the new gradient token**

In `app/globals.css`, find:

```css
  --gradient-cta: linear-gradient(100deg, #a81430 0%, #c81e3a 50%, #7a1128 100%); /* min white 5.67:1 */
```

and add directly after it:

```css
  --gradient-cta: linear-gradient(100deg, #a81430 0%, #c81e3a 50%, #7a1128 100%); /* min white 5.67:1 */
  /* Red-to-gold, matching cacnorthamerica.vercel.app's own CTA pill --
   * pairs with dark (#16121a) text, not white, since the gold end fails
   * white-text contrast (~1.5:1) per the --color-gold comment below. Used
   * only for the nav's Register button, not Button's shared `primary`
   * variant (which stays on the all-red --gradient-cta everywhere else). */
  --gradient-cta-gold: linear-gradient(100deg, #c81e3a 0%, #fdc841 100%);
```

- [ ] **Step 2: Update the Register button's translation to add a trailing arrow**

In `messages/en.json`'s `Nav` block, change:

```json
    "registerCta": "Register Now",
```

to:

```json
    "registerCta": "Register Now →",
```

In `messages/yo.json`'s `Nav` block, change:

```json
    "registerCta": "Forúkọsílẹ̀ Nísisìyí",
```

to:

```json
    "registerCta": "Forúkọsílẹ̀ Nísisìyí →",
```

- [ ] **Step 3: Update the two existing test assertions this text change affects**

In `tests/components/PrimaryNav.test.tsx`, both occurrences of the exact string `"Register Now"` as an accessible name need the arrow. Change:

```tsx
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register Now" })).toHaveAttribute("href", "/en/register");
```

to:

```tsx
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register Now →" })).toHaveAttribute("href", "/en/register");
```

and:

```tsx
  it("renders a dominant Register Now CTA and a secondary Give button", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Register Now" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Give" })).toBeInTheDocument();
  });
```

to:

```tsx
  it("renders a dominant Register Now CTA and a secondary Give button", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Register Now →" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Give" })).toBeInTheDocument();
  });
```

- [ ] **Step 4: Run the test to verify it fails first (confirms the test was actually exercising the old copy)**

Run: `npx vitest run tests/components/PrimaryNav.test.tsx`
Expected: FAIL at this point (the component still renders the old copy without an arrow) — confirms Step 3's updated assertions are live, not accidentally skipped.

- [ ] **Step 5: Apply the gradient + circular logo to the nav**

In `components/navigation/PrimaryNav.tsx`, change the logo image's className from:

```tsx
            className="h-11 w-11 flex-none rounded-xl object-cover"
```

to:

```tsx
            className="h-11 w-11 flex-none rounded-full object-cover"
```

Then change the Register button:

```tsx
          <Button href={`/${locale}/register`} variant="primary" aria-label={t("registerCta")}>
            <span aria-hidden="true" className="sm:hidden">{t("register")}</span>
            <span aria-hidden="true" className="hidden sm:inline">{t("registerCta")}</span>
          </Button>
```

to:

```tsx
          <Button
            href={`/${locale}/register`}
            variant="primary"
            aria-label={t("registerCta")}
            style={{ background: "var(--gradient-cta-gold)", color: "#16121a" }}
          >
            <span aria-hidden="true" className="sm:hidden">{t("register")}</span>
            <span aria-hidden="true" className="hidden sm:inline">{t("registerCta")}</span>
          </Button>
```

(`style` is a valid prop on `Button`'s link form — it extends `AnchorHTMLAttributes<HTMLAnchorElement>` — and since it's spread onto the underlying `<Link>` *after* the variant's own derived `style`, it fully replaces it; an inline `style.color` also always wins over the variant's `text-white` class regardless of Tailwind's internal class ordering.)

- [ ] **Step 6: Apply the circular logo to the footer's brand mark too**

In `components/navigation/FooterNav.tsx`, change:

```tsx
                className="h-10 w-10 flex-none rounded-lg object-cover"
```

to:

```tsx
                className="h-10 w-10 flex-none rounded-full object-cover"
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run tests/components/PrimaryNav.test.tsx tests/components/FooterNav.test.tsx`
Expected: PASS

- [ ] **Step 8: Run the full suite and typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS (aside from the pre-existing, unrelated `tests/lib/supabase-middleware.test.ts` typecheck errors already present on `HEAD`).

- [ ] **Step 9: Commit**

```bash
git add app/globals.css components/navigation/PrimaryNav.tsx components/navigation/FooterNav.tsx messages/en.json messages/yo.json tests/components/PrimaryNav.test.tsx
git commit -m "Polish nav/footer to match the sibling site: circular logo, red-gold CTA gradient, arrow suffix"
```

---

### Task 3: Newsletter signup — database + API route

**Files:**
- Create: `supabase/migrations/0009_newsletter_subscribers.sql`
- Modify: `types/database.types.ts`
- Create: `app/api/newsletter/route.ts`
- Test: `tests/app/api/newsletter.test.ts`

**Interfaces:**
- Produces: `POST /api/newsletter` accepting `{ email: string; website?: string }`, returning `NextResponse.json({ status: "success" | "already_subscribed" })` on success/duplicate, or `NextResponse.json({ error: string }, { status: 400 | 500 })` on failure. Task 4's `NewsletterForm` component calls this route by exact path.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0009_newsletter_subscribers.sql`:

```sql
-- Public newsletter signup capture for the footer's "Stay Connected" form
-- (app/api/newsletter/route.ts). Inserts always go through that route's
-- service-role client, never directly from the browser -- RLS is enabled
-- with zero policies so it defaults to fully denied even if a future
-- anon-key code path is ever added by mistake.
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;
```

- [ ] **Step 2: Add the table's TypeScript type**

In `types/database.types.ts`, the `Tables` are declared alphabetically. Find the end of the `convention_editions` entry (its closing `Relationships: []` and `}`, immediately before `pricing_tiers: {` begins), and insert a new `newsletter_subscribers` entry between them:

```ts
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      pricing_tiers: {
```

(Only the `newsletter_subscribers: { ... }` block above `pricing_tiers: {` is new — `pricing_tiers` and everything after it is unchanged, just shown here so the insertion point is unambiguous.)

- [ ] **Step 3: Write the failing test**

Create `tests/app/api/newsletter.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({
  from: () => ({ insert: insertMock }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: createServiceClientMock,
}));

beforeEach(() => {
  insertMock.mockReset();
  createServiceClientMock.mockClear();
});

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/newsletter", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/newsletter", () => {
  it("inserts a lowercased, trimmed email and returns success", async () => {
    insertMock.mockResolvedValue({ error: null });
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "  Person@Example.com  " }));
    const json = await res.json();

    expect(json).toEqual({ status: "success" });
    expect(insertMock).toHaveBeenCalledWith({ email: "person@example.com" });
  });

  it("returns already_subscribed on a unique-constraint violation", async () => {
    insertMock.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "person@example.com" }));
    const json = await res.json();

    expect(json).toEqual({ status: "already_subscribed" });
  });

  it("rejects an invalid email without inserting", async () => {
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "not-an-email" }));

    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("silently accepts a filled honeypot field without inserting or calling Supabase at all", async () => {
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "person@example.com", website: "http://spam.example" }));
    const json = await res.json();

    expect(json).toEqual({ status: "success" });
    expect(insertMock).not.toHaveBeenCalled();
    expect(createServiceClientMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid JSON", async () => {
    const { POST } = await import("../../../app/api/newsletter/route");
    const badRequest = new Request("http://localhost/api/newsletter", { method: "POST", body: "{not json" });

    const res = await POST(badRequest);

    expect(res.status).toBe(400);
  });

  it("returns 500 on an unexpected insert error", async () => {
    insertMock.mockResolvedValue({ error: { code: "XX000", message: "unexpected" } });
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "person@example.com" }));

    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tests/app/api/newsletter.test.ts`
Expected: FAIL — `Cannot find module '../../../app/api/newsletter/route'`

- [ ] **Step 5: Create the route**

Create `app/api/newsletter/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

type NewsletterRequestBody = {
  email: string;
  website?: string; // honeypot -- real visitors never see or fill this in
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = rawBody as Partial<NewsletterRequestBody>;

  // A filled honeypot field means a bot filled in every input it could
  // find. Respond exactly like a real success so it has no signal
  // anything was rejected, but never touch the database.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ status: "success" });
  }

  if (typeof body.email !== "string" || !EMAIL_PATTERN.test(body.email.trim())) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: body.email.trim().toLowerCase() });

  if (error) {
    // Postgres unique-violation -- this email is already subscribed, which
    // isn't a failure from the visitor's point of view.
    if (error.code === "23505") {
      return NextResponse.json({ status: "already_subscribed" });
    }
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ status: "success" });
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/app/api/newsletter.test.ts`
Expected: PASS (all 6 tests)

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: No new errors (the `newsletter_subscribers` table type must resolve correctly for `supabase.from("newsletter_subscribers").insert(...)` to typecheck — if this errors, re-check Step 2's insertion matches the existing entries' exact formatting).

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0009_newsletter_subscribers.sql types/database.types.ts app/api/newsletter/route.ts tests/app/api/newsletter.test.ts
git commit -m "Add a newsletter_subscribers table and POST /api/newsletter route"
```

---

### Task 4: Newsletter form + footer integration

**Files:**
- Create: `components/navigation/NewsletterForm.tsx`
- Modify: `components/navigation/FooterNav.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/NewsletterForm.test.tsx` (new)
- Modify: `tests/components/FooterNav.test.tsx`

**Interfaces:**
- Consumes: `POST /api/newsletter` from Task 3 (exact request/response shape above).
- Produces: `NewsletterForm` — a self-contained client component with no props, rendered inside `FooterNav`.

- [ ] **Step 1: Add translations**

In `messages/en.json`'s `Footer` block, add (anywhere among its existing keys, e.g. right after `"anniversaryBadge"`):

```json
    "anniversaryBadge": "50th Anniversary · 1976–2026",
    "contactCommitteeCta": "Contact the Convention Committee →",
    "newsletterHeading": "Stay Connected",
    "newsletterBody": "Convention updates and reminders, straight to your inbox.",
    "newsletterPlaceholder": "Your email address",
    "newsletterCta": "Subscribe",
    "newsletterSuccess": "You're subscribed — thank you!",
    "newsletterAlready": "You're already on the list — thank you!",
    "newsletterError": "Something went wrong. Please try again.",
```

In `messages/yo.json`'s `Footer` block, the same position:

```json
    "anniversaryBadge": "Ayẹyẹ Ọdún 50 · 1976–2026",
    "contactCommitteeCta": "Kàn Sí Ìgbìmọ̀ Àpéjọ →",
    "newsletterHeading": "Dàpọ̀ Mọ́ Wa",
    "newsletterBody": "Ìsọfúnni àti ìrántí àpéjọ, tààrà sí inú apoti-ìwé rẹ.",
    "newsletterPlaceholder": "Àdírẹ́sì ìmẹ́lì rẹ",
    "newsletterCta": "Forúkọsílẹ̀",
    "newsletterSuccess": "O ti forúkọsílẹ̀ — a dúpẹ́!",
    "newsletterAlready": "O ti wà nínú àkọsílẹ̀ náà tẹ́lẹ̀ — a dúpẹ́!",
    "newsletterError": "Àṣìṣe kan ṣẹlẹ̀. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansí.",
```

- [ ] **Step 2: Run the i18n parity test**

Run: `npx vitest run tests/i18n/messages.test.ts`
Expected: PASS

- [ ] **Step 3: Write the failing component test**

Create `tests/components/NewsletterForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { NewsletterForm } from "../../components/navigation/NewsletterForm";

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <NewsletterForm />
    </NextIntlClientProvider>
  );
}

describe("NewsletterForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("submits the email and shows the success message", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success" }),
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText("Your email address"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => {
      expect(screen.getByText("You're subscribed — thank you!")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/newsletter",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows the already-subscribed message when the API reports a duplicate", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ status: "already_subscribed" }),
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText("Your email address"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => {
      expect(screen.getByText("You're already on the list — thank you!")).toBeInTheDocument();
    });
  });

  it("shows an error message when the request fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "A valid email address is required" }),
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText("Your email address"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("includes a honeypot field that is present but not visible", () => {
    renderForm();
    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tests/components/NewsletterForm.test.tsx`
Expected: FAIL — `Cannot find module '../../components/navigation/NewsletterForm'`

- [ ] **Step 5: Create the component**

Create `components/navigation/NewsletterForm.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "submitting" | "success" | "already" | "error";

// Real footer newsletter signup (POST /api/newsletter, app/api/newsletter/route.ts).
// A hidden `website` honeypot field is the only spam mitigation -- real
// visitors never see or fill it in; a bot that fills every field it finds
// gets a normal-looking success response with no row ever written (handled
// server-side, this component just carries the field's value through).
export function NewsletterForm() {
  const t = useTranslations("Footer");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus(json.status === "already_subscribed" ? "already" : "success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "already") {
    return (
      <p className="text-sm font-semibold text-white">
        {status === "success" ? t("newsletterSuccess") : t("newsletterAlready")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="newsletter-email">
        {t("newsletterPlaceholder")}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("newsletterPlaceholder")}
        className="min-h-11 flex-1 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-[var(--color-gold)] focus:outline-none"
      />
      {/* Honeypot -- off-screen via absolute positioning (not display:none,
          which some bots skip but still fill in fields merely positioned
          off-canvas). tabIndex/autoComplete keep it out of the way for
          keyboard and autofill users too. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="min-h-11 flex-none rounded-full px-5 text-sm font-bold text-[#16121a] disabled:opacity-60"
        style={{ background: "var(--color-gold)" }}
      >
        {status === "submitting" ? "…" : t("newsletterCta")}
      </button>
      {status === "error" ? (
        <p role="alert" className="text-xs text-white/80">
          {t("newsletterError")}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/components/NewsletterForm.test.tsx`
Expected: PASS (all 4 tests)

- [ ] **Step 7: Write the failing footer integration test**

Add this test to the `describe("FooterNav", ...)` block in `tests/components/FooterNav.test.tsx`:

```tsx
  it("renders a Contact the Convention Committee CTA and the newsletter form", async () => {
    await renderFooter();
    expect(
      screen.getByRole("link", { name: /Contact the Convention Committee/ })
    ).toHaveAttribute("href", "/en/contact");
    expect(screen.getByPlaceholderText("Your email address")).toBeInTheDocument();
  });
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npx vitest run tests/components/FooterNav.test.tsx`
Expected: FAIL — neither element exists yet

- [ ] **Step 9: Wire both into `FooterNav.tsx`**

Add the imports at the top of `components/navigation/FooterNav.tsx`:

```tsx
import { NewsletterForm } from "@/components/navigation/NewsletterForm";
```

Add the "Contact the Convention Committee" CTA in the brand column, directly after the logo lockup's closing `</div>` and before the anniversary badge `<a>`. Find:

```tsx
              </span>
            </div>

            {/* Permanent (no dismiss) -- unlike AnniversaryBanner, this is a
                small always-visible pill, not an interruptive announcement. */}
            <a
              href={anniversary.moreInfoUrl}
```

and change it to:

```tsx
              </span>
            </div>

            <Link
              href={`/${locale}/contact`}
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold text-white"
              style={{ background: "var(--gradient-cta)" }}
            >
              {tFooter("contactCommitteeCta")}
            </Link>

            {/* Permanent (no dismiss) -- unlike AnniversaryBanner, this is a
                small always-visible pill, not an interruptive announcement. */}
            <a
              href={anniversary.moreInfoUrl}
```

Then add the "Stay Connected" newsletter band as its own full-width block, directly after the 5-column grid's closing `</div>` and before the CAC Family row. Find:

```tsx
          </div>
        </div>

        {/* External links to the wider CAC family, as a single wrapped row
```

and change it to:

```tsx
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-[var(--color-gold)]/25 bg-white/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div>
            <h4 className="font-display text-xl text-[var(--color-gold)]">{tFooter("newsletterHeading")}</h4>
            <p className="mt-1 max-w-[42ch] text-sm text-white/70">{tFooter("newsletterBody")}</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:w-80 sm:flex-none">
            <NewsletterForm />
          </div>
        </div>

        {/* External links to the wider CAC family, as a single wrapped row
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npx vitest run tests/components/FooterNav.test.tsx`
Expected: PASS (all tests in the file)

- [ ] **Step 11: Run the full suite and typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS (aside from the same pre-existing, unrelated failures noted in Global Constraints).

- [ ] **Step 12: Commit**

```bash
git add components/navigation/NewsletterForm.tsx components/navigation/FooterNav.tsx messages/en.json messages/yo.json tests/components/NewsletterForm.test.tsx tests/components/FooterNav.test.tsx
git commit -m "Add a footer newsletter signup and a Contact the Convention Committee CTA"
```

---

### Task 5: Content density — tighten two verbose sections

**Files:**
- Modify: `messages/en.json`, `messages/yo.json`

**Interfaces:** none (copy-only change; no component/prop changes).

- [ ] **Step 1: Tighten `Home.missionBody`**

In `messages/en.json`'s `Home` block, change:

```json
    "missionBody": "Every convention follows the same rhythm: daily prayer and worship, ministers' sessions from visiting CAC leadership, break-outs for youth, young adults, and children's ministry, and a revival night every evening — closing with Holy Communion and a send-off service.",
```

to:

```json
    "missionBody": "Every convention follows the same rhythm: daily prayer, ministers' sessions, youth and children's break-outs, and a nightly revival service — closing in Holy Communion and a send-off.",
```

In `messages/yo.json`'s `Home` block, change:

```json
    "missionBody": "Àpéjọ kọ̀ọ̀kan máa ń tẹ̀lé ìlànà kan náà: àdúrà àti ìjọsìn ojoojúmọ́, ìpàdé àwọn aṣíwájú láti ọwọ́ àwọn aṣíwájú CAC tí wọ́n wá, ìpàdé pàtàkì fún àwọn ọ̀dọ́ àti ọmọdé, àti alẹ́ ìsọ̀jí ní alẹ́ kọ̀ọ̀kan — tí a óò fi Oúnjẹ Alẹ́ Olúwa àti iṣẹ́ ìsìn ìdágbére parí.",
```

to:

```json
    "missionBody": "Àpéjọ kọ̀ọ̀kan máa ń tẹ̀lé ìlànà kan náà: àdúrà ojoojúmọ́, ìpàdé àwọn aṣíwájú, ìpàdé pàtàkì fún àwọn ọ̀dọ́ àti ọmọdé, àti alẹ́ ìsọ̀jí — tí a óò fi Oúnjẹ Alẹ́ Olúwa àti ìdágbére parí.",
```

- [ ] **Step 2: Tighten `Give.moreWaysBody`**

In `messages/en.json`'s `Give` block, change:

```json
    "moreWaysBody": "CACNA's other campaigns — the CAC Centenary Building Project and the Hope For All Initiative — are on our main site, along with phone and email options if online giving isn't set up for your bank.",
```

to:

```json
    "moreWaysBody": "See CACNA's other campaigns — the CAC Centenary Building Project and Hope For All Initiative — plus phone and email giving options, on our main site.",
```

In `messages/yo.json`'s `Give` block, change:

```json
    "moreWaysBody": "Àwọn iṣẹ́ mìíràn ti CACNA — Iṣẹ́ Ilé Ẹ̀wádún CAC àti Iṣẹ́ Ìrètí Fún Gbogbo Ènìyàn — ń bẹ ní ojú-òpó wẹ́ẹ̀bù àkọ́kọ́ wa, pẹ̀lú àwọn ọ̀nà fóònù àti ímeèlì bí ẹ̀bùn oníayélujára kò bá ṣiṣẹ́ fún báńkì rẹ.",
```

to:

```json
    "moreWaysBody": "Wo àwọn iṣẹ́ mìíràn ti CACNA — Iṣẹ́ Ilé Ẹ̀wádún CAC àti Iṣẹ́ Ìrètí Fún Gbogbo Ènìyàn — pẹ̀lú àwọn ọ̀nà fóònù àti ímeèlì, ní ojú-òpó wẹ́ẹ̀bù àkọ́kọ́ wa.",
```

- [ ] **Step 3: Run the i18n parity and affected page tests**

Run: `npx vitest run tests/i18n/messages.test.ts tests/app/home.test.tsx tests/app/give.test.tsx`
Expected: PASS (neither exact string is asserted on in any test — confirmed by grepping the test suite for both phrases before making this change — so this is copy-only with no test updates needed).

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/yo.json
git commit -m "Tighten Home mission and Give more-ways-to-give copy"
```

---

### Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: PASS, aside from the single pre-existing, unrelated failure in `tests/lib/supabase-middleware.test.ts` and the flaky `tests/app/home.test.tsx` CountUp-timing test (both confirmed present on `HEAD` before this plan started).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors beyond the same pre-existing `tests/lib/supabase-middleware.test.ts` errors.

- [ ] **Step 3: Build**

Run: `npx next build`
Expected: Succeeds — this is the real gate for the font-subset swap (Task 1) and confirms the new `/api/newsletter` route compiles.

- [ ] **Step 4: Lint the new/changed files**

Run:

```bash
npx eslint lib/fonts.ts app/globals.css components/navigation/PrimaryNav.tsx components/navigation/FooterNav.tsx components/navigation/NewsletterForm.tsx "app/api/newsletter/route.ts" types/database.types.ts
```

Expected: No output (clean).

- [ ] **Step 5: Live browser check**

Start the dev server preview and check:
1. Both `/en` and `/yo` render in the new fonts (Bricolage Grotesque headings, Plus Jakarta Sans body) with no visible FOUT/layout-shift regression, and no missing-glyph boxes in Yoruba text.
2. The nav's "Register Now →" button shows the new red→gold gradient with dark, legible text; the logo mark is circular in both the nav and the footer.
3. The footer shows the new "Contact the Convention Committee →" CTA (linking to `/en/contact`) and the "Stay Connected" newsletter band.
4. Submit the newsletter form with a real-looking email — confirm the success message appears, then re-submit the same email and confirm the "already subscribed" message appears instead of an error.
5. Check the `Home` and `Give` pages for the tightened copy from Task 5.

No code changes expected in this step unless an issue is found — if one is, fix it, re-run the affected test file, and commit the fix separately before continuing.
