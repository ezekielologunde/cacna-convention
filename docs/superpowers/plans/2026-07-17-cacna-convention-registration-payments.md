# CACNA Convention — Registration & Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Individual and church/group registration with real Stripe payment, server-validated pricing, a confirmation flow, and the dynamic registration-promo banners deferred from Plan 2.

**Architecture:** `pricing_tiers` and `registrations`/`registrants` Supabase tables (RLS: public read on pricing, admin-only + service-role-only on registrations/registrants — no public read/write, since they hold PII and payment state). A registration form posts to a Next.js API route that re-validates every price server-side and creates a Stripe Checkout Session; a webhook route marks payment status and sends a confirmation email. Per the user's explicit choice, all of this is built and tested against mocked Stripe/Resend clients first — wiring the real API keys is the last, isolated task.

**Tech Stack:** Same as Plans 1-2, plus `stripe` (Node SDK) and `resend`.

## Global Constraints

- Price is never trusted from the client — the checkout API route looks up `pricing_tiers` itself for every line item (design spec §6).
- `registrations`/`registrants` have no public SELECT or INSERT policy at all — every write goes through a server-side API route using `createServiceClient()` (bypasses RLS by design), never the anon/browser client.
- Registration only targets the edition with `status in ('current','upcoming')` — same "no hardcoded year" rule Plan 2 established for Schedule. Until Plan 5 creates a 2027 edition (with pricing tiers), the registration page shows an empty/not-yet-open state — this is expected, not a bug.
- Bilingual parity (en/yo) on every new page/message key, enforced by the existing `tests/i18n/messages.test.ts`.
- Stripe/Resend integration code must be unit-testable against mocked clients — do not require real API keys until Task 9.
- Reuse the shared test helpers this plan's Task 1 extracts — don't re-hand-roll the `next-intl/server` mock or a Supabase query-builder mock per test file.
- Commit after every task.

---

### Task 1: Shared test helpers and `getActiveEdition`

**Files:**
- Create: `tests/helpers/next-intl-server-mock.ts`
- Create: `lib/editions.ts`
- Modify: `tests/app/plan-your-visit.test.tsx`, `tests/app/archive.test.tsx`, `tests/app/contact.test.tsx`, `tests/app/home.test.tsx` (use the new helper instead of each file's own inline mock)
- Modify: `app/(site)/[locale]/schedule/page.tsx` (use the new `getActiveEdition` helper instead of its own inline query)
- Test: `tests/lib/editions.test.ts`

**Interfaces:**
- Produces: `createNextIntlServerMock(messages: Record<string, unknown>)` — returns a `next-intl/server` mock object (`setRequestLocale`, `getTranslations`) reading real translations, for `vi.mock("next-intl/server", () => createNextIntlServerMock(en))` in any test. Produces `getActiveEdition(supabase): Promise<{id: string; year: number} | null>` — every later task's registration/pricing pages call this.

- [ ] **Step 1: Extract the test helper**

Create `tests/helpers/next-intl-server-mock.ts`:

```ts
import { vi } from "vitest";

export function createNextIntlServerMock(messages: Record<string, unknown>) {
  function resolve(namespace: string) {
    const parts = namespace.split(".");
    let node: unknown = messages;
    for (const part of parts) {
      node = (node as Record<string, unknown>)?.[part];
    }
    return node as Record<string, string>;
  }

  return {
    setRequestLocale: vi.fn(),
    getTranslations: vi.fn(async (namespace: string) => {
      const bundle = resolve(namespace);
      return (key: string, values?: Record<string, string | number>) => {
        let text = bundle[key] ?? key;
        if (values) {
          for (const [k, v] of Object.entries(values)) {
            text = text.replace(`{${k}}`, String(v));
          }
        }
        return text;
      };
    }),
  };
}
```

- [ ] **Step 2: Update the four existing page tests to use it**

In each of `tests/app/plan-your-visit.test.tsx`, `tests/app/archive.test.tsx`, `tests/app/contact.test.tsx`, `tests/app/home.test.tsx`: replace the inline `vi.mock("next-intl/server", () => ({ setRequestLocale: ..., getTranslations: ... }))` block with:

```ts
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import en from "../../messages/en.json";

vi.mock("next-intl/server", () => createNextIntlServerMock(en));
```

Keep every other part of each test file (the Supabase mocks, the assertions) exactly as they are — this only replaces the `next-intl/server` mock block.

- [ ] **Step 3: Run the full suite to confirm the refactor didn't break anything**

Run: `npm test`
Expected: PASS — same pass count as before (22 files / 45 tests), just less duplicated mock code.

- [ ] **Step 4: Write the failing test for `getActiveEdition`**

Create `tests/lib/editions.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { getActiveEdition } from "../../lib/editions";

describe("getActiveEdition", () => {
  it("queries convention_editions for current/upcoming status, earliest year first", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: { id: "edition-1", year: 2027 },
      error: null,
    });
    const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
    const orderMock = vi.fn(() => ({ limit: limitMock }));
    const inMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ in: inMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    const result = await getActiveEdition(supabase);

    expect(fromMock).toHaveBeenCalledWith("convention_editions");
    expect(inMock).toHaveBeenCalledWith("status", ["current", "upcoming"]);
    expect(orderMock).toHaveBeenCalledWith("year", { ascending: true });
    expect(result).toEqual({ id: "edition-1", year: 2027 });
  });

  it("returns null when no current/upcoming edition exists", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
    const orderMock = vi.fn(() => ({ limit: limitMock }));
    const inMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ in: inMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    const result = await getActiveEdition(supabase);

    expect(result).toBeNull();
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `lib/editions.ts` does not exist.

- [ ] **Step 6: Write the minimal implementation**

Create `lib/editions.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ActiveEdition = Pick<
  Database["public"]["Tables"]["convention_editions"]["Row"],
  "id" | "year"
>;

export async function getActiveEdition(
  supabase: SupabaseClient<Database>
): Promise<ActiveEdition | null> {
  const { data, error } = await supabase
    .from("convention_editions")
    .select("id, year")
    .in("status", ["current", "upcoming"])
    .order("year", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Refactor the Schedule page to use it**

Modify `app/(site)/[locale]/schedule/page.tsx` — replace its inline `supabase.from("convention_editions").select("id").in(...).order(...).limit(1).maybeSingle()` block with a call to `getActiveEdition(supabase)` (adjust the destructured field — it now returns `{id, year}` instead of just `{id}`; use `edition.id` the same way as before). Update `tests/app/schedule.test.tsx`'s Supabase mock shape if needed to match the new `getActiveEdition` call chain (it now selects `"id, year"` not `"id"`, and the test's assertion on the `.in()` call should still pass unchanged since the arguments are identical).

- [ ] **Step 9: Run the full suite and build**

Run: `npm test` — expect PASS, same or higher test count.
Run: `npm run build` — expect success, `/schedule` still dynamic, same route table as before.

- [ ] **Step 10: Commit**

```bash
git add tests/helpers/next-intl-server-mock.ts lib/editions.ts tests/lib/editions.test.ts tests/app/plan-your-visit.test.tsx tests/app/archive.test.tsx tests/app/contact.test.tsx tests/app/home.test.tsx "app/(site)/[locale]/schedule/page.tsx" tests/app/schedule.test.tsx
git commit -m "Extract shared next-intl/server test mock and getActiveEdition helper"
```

---

### Task 2: Pricing tiers data model

**Files:**
- Create: `supabase/migrations/0004_pricing_tiers.sql`
- Modify: `types/database.types.ts`
- Create: `lib/pricing.ts`
- Test: `tests/lib/pricing.test.ts`

**Interfaces:**
- Produces: `pricing_tiers` table (`id, edition_id, category, price_cents, starts_on, ends_on, sort_order, created_at`) and `getActivePricingForEdition(supabase, editionId, onDate?): Promise<PricingTier[]>` + `priceForCategory(tiers, category): number | null` in `lib/pricing.ts` — Task 6 (checkout API route) is the primary consumer.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0004_pricing_tiers.sql`:

```sql
create table pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references convention_editions(id) on delete cascade,
  category text not null check (category in ('adult', 'young_adult', 'child')),
  price_cents integer not null,
  starts_on date not null,
  ends_on date not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index pricing_tiers_edition_idx on pricing_tiers (edition_id, category, starts_on);

alter table pricing_tiers enable row level security;

create policy "pricing_tiers readable by everyone"
  on pricing_tiers for select
  using (true);

create policy "pricing_tiers writable by admins"
  on pricing_tiers for all
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()))
  with check (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));
```

No seed data — pricing tiers are entered by an admin once a real 2027 edition exists (Plan 5).

- [ ] **Step 2: Apply the migration**

Use the Supabase MCP tools (`apply_migration` against project `cqmswuiloehkrrxvtxcz`), then `list_tables` to confirm `pricing_tiers` exists with the expected columns and `rls_enabled: true`.

- [ ] **Step 3: Update database types**

Modify `types/database.types.ts` — add a `pricing_tiers` entry to `Tables`, matching the existing style:

```ts
      pricing_tiers: {
        Row: {
          id: string;
          edition_id: string;
          category: "adult" | "young_adult" | "child";
          price_cents: number;
          starts_on: string;
          ends_on: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          category: "adult" | "young_adult" | "child";
          price_cents: number;
          starts_on: string;
          ends_on: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pricing_tiers"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 4: Write the failing test**

Create `tests/lib/pricing.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { getActivePricingForEdition, priceForCategory } from "../../lib/pricing";

describe("getActivePricingForEdition", () => {
  it("queries pricing_tiers filtered by edition and today's date window", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ id: "t1", category: "adult", price_cents: 12500 }],
      error: null,
    });
    const gteMock = vi.fn(() => ({ order: orderMock }));
    const lteMock = vi.fn(() => ({ gte: gteMock }));
    const eqMock = vi.fn(() => ({ lte: lteMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: fromMock } as never;

    const result = await getActivePricingForEdition(supabase, "edition-1", new Date("2026-03-01"));

    expect(fromMock).toHaveBeenCalledWith("pricing_tiers");
    expect(eqMock).toHaveBeenCalledWith("edition_id", "edition-1");
    expect(lteMock).toHaveBeenCalledWith("starts_on", "2026-03-01");
    expect(gteMock).toHaveBeenCalledWith("ends_on", "2026-03-01");
    expect(result).toEqual([{ id: "t1", category: "adult", price_cents: 12500 }]);
  });
});

describe("priceForCategory", () => {
  it("returns the price for a matching category", () => {
    const tiers = [{ category: "adult", price_cents: 12500 }] as never;
    expect(priceForCategory(tiers, "adult")).toBe(12500);
  });

  it("returns null when no tier matches the category", () => {
    const tiers = [{ category: "adult", price_cents: 12500 }] as never;
    expect(priceForCategory(tiers, "child")).toBeNull();
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `lib/pricing.ts` does not exist.

- [ ] **Step 6: Write the minimal implementation**

Create `lib/pricing.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type PricingTier = Database["public"]["Tables"]["pricing_tiers"]["Row"];
export type RegistrantCategory = "adult" | "young_adult" | "child";

export async function getActivePricingForEdition(
  supabase: SupabaseClient<Database>,
  editionId: string,
  onDate: Date = new Date()
): Promise<PricingTier[]> {
  const iso = onDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("pricing_tiers")
    .select("*")
    .eq("edition_id", editionId)
    .lte("starts_on", iso)
    .gte("ends_on", iso)
    .order("category", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function priceForCategory(
  tiers: Pick<PricingTier, "category" | "price_cents">[],
  category: RegistrantCategory
): number | null {
  const tier = tiers.find((t) => t.category === category);
  return tier ? tier.price_cents : null;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0004_pricing_tiers.sql types/database.types.ts lib/pricing.ts tests/lib/pricing.test.ts
git commit -m "Add pricing_tiers table and getActivePricingForEdition"
```

---

### Task 3: Registrations and registrants data model

**Files:**
- Create: `supabase/migrations/0005_registrations.sql`
- Modify: `types/database.types.ts`
- Test: `tests/lib/registrations-schema.test.ts` (a thin smoke test — see Step 1)

**Interfaces:**
- Produces: `registrations` (`id, edition_id, registration_type, church_name, contact_name, contact_email, contact_phone, stripe_checkout_session_id, stripe_payment_intent_id, status, total_amount_cents, created_at, updated_at`) and `registrants` (`id, registration_id, full_name, category, price_cents, created_at`) tables. Task 6 (checkout route) and Task 7 (webhook) are the only writers.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0005_registrations.sql`:

```sql
create table registrations (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references convention_editions(id) on delete restrict,
  registration_type text not null check (registration_type in ('individual', 'group')),
  church_name text,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')) default 'pending',
  total_amount_cents integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table registrants (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  full_name text not null,
  category text not null check (category in ('adult', 'young_adult', 'child')),
  price_cents integer not null,
  created_at timestamptz not null default now()
);

create index registrants_registration_idx on registrants (registration_id);
create index registrations_edition_idx on registrations (edition_id, status);

alter table registrations enable row level security;
alter table registrants enable row level security;

-- No public select/insert/update policy at all: these tables hold PII and
-- payment state. Every write goes through a server-side API route using the
-- service-role client (bypasses RLS by design). Admins get an explicit
-- read policy for defense-in-depth / a future direct-client admin dashboard.
create policy "registrations readable by admins"
  on registrations for select
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));

create policy "registrants readable by admins"
  on registrants for select
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));
```

- [ ] **Step 2: Apply the migration**

Use the Supabase MCP tools (`apply_migration`), then `list_tables` to confirm both tables exist with `rls_enabled: true` and no public-facing policies beyond what's declared above.

- [ ] **Step 3: Update database types**

Modify `types/database.types.ts` — add `registrations` and `registrants` entries to `Tables`, matching the existing style (including `Relationships: []`, and nullable fields for `church_name`, `contact_phone`, `stripe_checkout_session_id`, `stripe_payment_intent_id`):

```ts
      registrations: {
        Row: {
          id: string;
          edition_id: string;
          registration_type: "individual" | "group";
          church_name: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          status: "pending" | "paid" | "failed" | "refunded";
          total_amount_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          registration_type: "individual" | "group";
          church_name?: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          status?: "pending" | "paid" | "failed" | "refunded";
          total_amount_cents: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["registrations"]["Insert"]>;
        Relationships: [];
      };
      registrants: {
        Row: {
          id: string;
          registration_id: string;
          full_name: string;
          category: "adult" | "young_adult" | "child";
          price_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          full_name: string;
          category: "adult" | "young_adult" | "child";
          price_cents: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["registrants"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 4: Write a schema smoke test**

Create `tests/lib/registrations-schema.test.ts` — this is a thin compile-time/shape check rather than a behavioral test, since no query-helper function exists yet for this task (Task 6 adds the first one):

```ts
import { describe, it, expect } from "vitest";
import type { Database } from "../../types/database.types";

describe("registrations/registrants schema types", () => {
  it("registrations Row has the expected required fields", () => {
    const row: Database["public"]["Tables"]["registrations"]["Row"] = {
      id: "r1",
      edition_id: "e1",
      registration_type: "individual",
      church_name: null,
      contact_name: "Jane Doe",
      contact_email: "jane@example.com",
      contact_phone: null,
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: null,
      status: "pending",
      total_amount_cents: 12500,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };
    expect(row.status).toBe("pending");
  });

  it("registrants Row has the expected required fields", () => {
    const row: Database["public"]["Tables"]["registrants"]["Row"] = {
      id: "g1",
      registration_id: "r1",
      full_name: "Jane Doe",
      category: "adult",
      price_cents: 12500,
      created_at: "2026-01-01T00:00:00Z",
    };
    expect(row.category).toBe("adult");
  });
});
```

- [ ] **Step 5: Run the test**

Run: `npm test`
Expected: PASS (this test passes as soon as the types compile — it exists to catch a future accidental type shape regression, not to drive new implementation).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0005_registrations.sql types/database.types.ts tests/lib/registrations-schema.test.ts
git commit -m "Add registrations and registrants tables"
```

---

### Task 4: Registration form — individual mode

**Files:**
- Create: `app/(site)/[locale]/register/page.tsx`
- Create: `components/register/RegistrationForm.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/RegistrationForm.test.tsx`

**Interfaces:**
- Produces: `RegistrationForm`, a client component managing form state for one or more registrants plus contact info, with a `mode: "individual" | "group"` prop. This task only wires the `"individual"` mode (exactly one registrant, no add/remove UI, no church name field) — Task 5 adds group mode to the same component. `onSubmit` prop callback receives the assembled payload; Task 6 wires the real submit handler.

- [ ] **Step 1: Add message keys**

Add to both `messages/en.json` and `messages/yo.json` under `Register`:

`en.json`:
```json
"Register": {
  "title": "Register",
  "individualTab": "Individual",
  "groupTab": "Church / Group",
  "fullName": "Full name",
  "category": "Category",
  "categoryAdult": "Adult (30+)",
  "categoryYoungAdult": "Young Adult (20-29)",
  "categoryChild": "Child (1-19) — Free",
  "contactName": "Contact name",
  "contactEmail": "Email",
  "contactPhone": "Phone",
  "submit": "Continue to Payment",
  "notOpenYet": "Registration for the next convention isn't open yet — check back soon."
}
```

`yo.json`:
```json
"Register": {
  "title": "Forúkọsílẹ̀",
  "individualTab": "Ẹnìkọ̀ọ̀kan",
  "groupTab": "Ìjọ / Ẹgbẹ́",
  "fullName": "Orúkọ Kíkún",
  "category": "Ẹ̀ka",
  "categoryAdult": "Àgbà (30+)",
  "categoryYoungAdult": "Ọ̀dọ́mọdé Àgbà (20-29)",
  "categoryChild": "Ọmọdé (1-19) — Ọ̀fẹ́",
  "contactName": "Orúkọ Olùbánisọ̀rọ̀",
  "contactEmail": "Ímeèlì",
  "contactPhone": "Fóònù",
  "submit": "Tẹ̀síwájú sí Ìsanwó",
  "notOpenYet": "Ìforúkọsílẹ̀ fún àpéjọ tí ń bọ̀ kò tíì ṣí — ṣàyẹ̀wò padà láìpẹ́."
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/components/RegistrationForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { RegistrationForm } from "../../components/register/RegistrationForm";
import messages from "../../messages/en.json";

function renderForm(onSubmit = vi.fn()) {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <RegistrationForm mode="individual" onSubmit={onSubmit} />
    </NextIntlClientProvider>
  );
  return onSubmit;
}

describe("RegistrationForm (individual mode)", () => {
  it("submits one registrant with contact info", () => {
    const onSubmit = renderForm();

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "adult" } });
    fireEvent.change(screen.getByLabelText("Contact name"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to Payment" }));

    expect(onSubmit).toHaveBeenCalledWith({
      registrationType: "individual",
      churchName: null,
      contactName: "Jane Doe",
      contactEmail: "jane@example.com",
      contactPhone: "",
      registrants: [{ fullName: "Jane Doe", category: "adult" }],
    });
  });

  it("does not render a church-name field or add-registrant button in individual mode", () => {
    renderForm();
    expect(screen.queryByLabelText(/church/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `components/register/RegistrationForm.tsx` does not exist.

- [ ] **Step 4: Write the minimal implementation**

Create `components/register/RegistrationForm.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

export type RegistrantCategory = "adult" | "young_adult" | "child";

export type RegistrationPayload = {
  registrationType: "individual" | "group";
  churchName: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  registrants: { fullName: string; category: RegistrantCategory }[];
};

export function RegistrationForm({
  mode,
  onSubmit,
}: {
  mode: "individual" | "group";
  onSubmit: (payload: RegistrationPayload) => void;
}) {
  const t = useTranslations("Register");
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState<RegistrantCategory>("adult");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      registrationType: mode,
      churchName: null,
      contactName,
      contactEmail,
      contactPhone,
      registrants: [{ fullName, category }],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1">
        {t("fullName")}
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("category")}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as RegistrantCategory)}
          className="rounded border border-[var(--color-border)] px-3 py-2"
        >
          <option value="adult">{t("categoryAdult")}</option>
          <option value="young_adult">{t("categoryYoungAdult")}</option>
          <option value="child">{t("categoryChild")}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        {t("contactName")}
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("contactEmail")}
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("contactPhone")}
        <input
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-[var(--color-brand)] px-5 py-2 font-medium text-[var(--color-brand-contrast)]"
      >
        {t("submit")}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Wire the page**

Create `app/(site)/[locale]/register/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { RegisterPageClient } from "@/components/register/RegisterPageClient";

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

  if (!edition) {
    return (
      <div className="px-6 py-12">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{t("notOpenYet")}</p>
      </div>
    );
  }

  return <RegisterPageClient editionId={edition.id} />;
}
```

`RegisterPageClient` (the tab-switching + submit-wiring wrapper around `RegistrationForm`) is created in Task 5, since it needs both individual and group modes to make the tab UI meaningful — for this task, the empty-state branch is what's actually reachable and testable (no current/upcoming edition exists yet in the live database), matching the pattern Plan 2's Schedule page established.

- [ ] **Step 7: Commit**

```bash
git add app/(site)/[locale]/register components/register/RegistrationForm.tsx messages/en.json messages/yo.json tests/components/RegistrationForm.test.tsx
git commit -m "Add registration form (individual mode) and register page"
```

Note: `npm run build` will fail after this commit alone, since `RegisterPageClient` doesn't exist yet — that's expected and resolved in Task 5's commit. If your workflow requires a green build after every commit, do Task 5 immediately after this one before running the final full-suite/build check.

---

### Task 5: Registration form — group/church mode and page wiring

**Files:**
- Modify: `components/register/RegistrationForm.tsx`
- Create: `components/register/RegisterPageClient.tsx`
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/RegistrationForm.test.tsx` (add group-mode cases)

**Interfaces:**
- Produces: `RegisterPageClient({ editionId })` — mounts a tab switcher (Individual / Church-Group) over `RegistrationForm`, holds the submit handler (a stub in this task — Task 6 replaces it with the real API call).

- [ ] **Step 1: Add message keys**

Add to both `messages/en.json` and `messages/yo.json`, inside the existing `Register` block:

`en.json` additions:
```json
"churchName": "Church name",
"addRegistrant": "Add another registrant",
"removeRegistrant": "Remove"
```

`yo.json` additions:
```json
"churchName": "Orúkọ Ìjọ",
"addRegistrant": "Ṣafikun Olùforúkọsílẹ̀ mìíràn",
"removeRegistrant": "Yọ Kúrò"
```

- [ ] **Step 2: Write the failing test additions**

Add to `tests/components/RegistrationForm.test.tsx`:

```tsx
describe("RegistrationForm (group mode)", () => {
  it("renders a church-name field and lets you add/remove registrants", () => {
    const onSubmit = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <RegistrationForm mode="group" onSubmit={onSubmit} />
      </NextIntlClientProvider>
    );

    expect(screen.getByLabelText("Church name")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add another registrant" }));
    const nameInputs = screen.getAllByLabelText("Full name");
    expect(nameInputs).toHaveLength(2);

    fireEvent.change(nameInputs[0], { target: { value: "Jane Doe" } });
    fireEvent.change(nameInputs[1], { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText("Church name"), { target: { value: "CAC Test Assembly" } });
    fireEvent.change(screen.getByLabelText("Contact name"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to Payment" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationType: "group",
        churchName: "CAC Test Assembly",
        registrants: [
          { fullName: "Jane Doe", category: "adult" },
          { fullName: "John Doe", category: "adult" },
        ],
      })
    );
  });

  it("lets you remove a registrant", () => {
    const onSubmit = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <RegistrationForm mode="group" onSubmit={onSubmit} />
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add another registrant" }));
    expect(screen.getAllByLabelText("Full name")).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect(screen.getAllByLabelText("Full name")).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `RegistrationForm` doesn't yet support `mode="group"` (no church-name field, no add/remove).

- [ ] **Step 4: Rewrite `RegistrationForm` to support both modes**

Modify `components/register/RegistrationForm.tsx` in full:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

export type RegistrantCategory = "adult" | "young_adult" | "child";

export type RegistrationPayload = {
  registrationType: "individual" | "group";
  churchName: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  registrants: { fullName: string; category: RegistrantCategory }[];
};

type RegistrantRow = { fullName: string; category: RegistrantCategory };

export function RegistrationForm({
  mode,
  onSubmit,
}: {
  mode: "individual" | "group";
  onSubmit: (payload: RegistrationPayload) => void;
}) {
  const t = useTranslations("Register");
  const [churchName, setChurchName] = useState("");
  const [registrants, setRegistrants] = useState<RegistrantRow[]>([
    { fullName: "", category: "adult" },
  ]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  function updateRegistrant(index: number, patch: Partial<RegistrantRow>) {
    setRegistrants((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addRegistrant() {
    setRegistrants((current) => [...current, { fullName: "", category: "adult" }]);
  }

  function removeRegistrant(index: number) {
    setRegistrants((current) => current.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      registrationType: mode,
      churchName: mode === "group" ? churchName : null,
      contactName,
      contactEmail,
      contactPhone,
      registrants,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      {mode === "group" ? (
        <label className="flex flex-col gap-1">
          {t("churchName")}
          <input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            required
            className="rounded border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      ) : null}

      {registrants.map((registrant, index) => (
        <div key={index} className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4">
          <label className="flex flex-col gap-1">
            {t("fullName")}
            <input
              value={registrant.fullName}
              onChange={(e) => updateRegistrant(index, { fullName: e.target.value })}
              required
              className="rounded border border-[var(--color-border)] px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("category")}
            <select
              value={registrant.category}
              onChange={(e) =>
                updateRegistrant(index, { category: e.target.value as RegistrantCategory })
              }
              className="rounded border border-[var(--color-border)] px-3 py-2"
            >
              <option value="adult">{t("categoryAdult")}</option>
              <option value="young_adult">{t("categoryYoungAdult")}</option>
              <option value="child">{t("categoryChild")}</option>
            </select>
          </label>
          {mode === "group" && registrants.length > 1 ? (
            <button
              type="button"
              onClick={() => removeRegistrant(index)}
              className="self-start text-sm text-[var(--color-muted)] underline"
            >
              {t("removeRegistrant")}
            </button>
          ) : null}
        </div>
      ))}

      {mode === "group" ? (
        <button
          type="button"
          onClick={addRegistrant}
          className="self-start rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
        >
          {t("addRegistrant")}
        </button>
      ) : null}

      <label className="flex flex-col gap-1">
        {t("contactName")}
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("contactEmail")}
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("contactPhone")}
        <input
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-[var(--color-brand)] px-5 py-2 font-medium text-[var(--color-brand-contrast)]"
      >
        {t("submit")}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Run the full suite to verify it passes**

Run: `npm test`
Expected: PASS — all individual-mode tests from Task 4 still pass (unchanged behavior for `mode="individual"`), plus the new group-mode tests.

- [ ] **Step 6: Create the page-wiring client component**

Create `components/register/RegisterPageClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RegistrationForm, type RegistrationPayload } from "./RegistrationForm";

export function RegisterPageClient({ editionId }: { editionId: string }) {
  const t = useTranslations("Register");
  const [mode, setMode] = useState<"individual" | "group">("individual");

  function handleSubmit(payload: RegistrationPayload) {
    // Task 6 replaces this with a real POST to /api/register using editionId.
    console.log("submit", editionId, payload);
  }

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <div role="tablist" className="mt-6 flex gap-4 border-b border-[var(--color-border)]">
        <button
          role="tab"
          aria-selected={mode === "individual"}
          onClick={() => setMode("individual")}
          className="px-3 py-2"
        >
          {t("individualTab")}
        </button>
        <button
          role="tab"
          aria-selected={mode === "group"}
          onClick={() => setMode("group")}
          className="px-3 py-2"
        >
          {t("groupTab")}
        </button>
      </div>
      <div className="mt-6">
        <RegistrationForm mode={mode} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: succeeds; `/en/register` and `/yo/register` both build (dynamic, since the page queries Supabase) and show the "not open yet" empty state given no current/upcoming edition exists.

- [ ] **Step 8: Commit**

```bash
git add components/register/RegistrationForm.tsx components/register/RegisterPageClient.tsx messages/en.json messages/yo.json tests/components/RegistrationForm.test.tsx
git commit -m "Add group/church registration mode and wire the register page"
```

---

### Task 6: Stripe checkout API route

**Files:**
- Create: `lib/stripe.ts`
- Create: `app/api/register/route.ts`
- Modify: `components/register/RegisterPageClient.tsx` (real submit handler)
- Test: `tests/app/api/register.test.ts`

**Interfaces:**
- Consumes: `getActivePricingForEdition`/`priceForCategory` (Task 2), `createServiceClient` (Foundation Task 3).
- Produces: `getStripeClient(): Stripe` in `lib/stripe.ts` (a thin factory so tests can mock it and Task 9 has one place to wire the real key). `POST /api/register` — validates the payload, re-prices every registrant server-side, creates a `registrations` row (`status: "pending"`) + `registrants` rows, creates a Stripe Checkout Session, returns `{ checkoutUrl }`.

- [ ] **Step 1: Install the Stripe SDK**

Run: `npm install stripe`

- [ ] **Step 2: Write the Stripe client factory**

Create `lib/stripe.ts`:

```ts
import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

export function getStripeClient(): Stripe {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-01-27.acacia",
  });
}
```

- [ ] **Step 3: Write the failing test for the API route**

Create `tests/app/api/register.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const getActiveEditionMock = vi.fn();
vi.mock("@/lib/editions", () => ({
  getActiveEdition: getActiveEditionMock,
}));

const getActivePricingMock = vi.fn();
vi.mock("@/lib/pricing", () => ({
  getActivePricingForEdition: getActivePricingMock,
  priceForCategory: (tiers: { category: string; price_cents: number }[], category: string) =>
    tiers.find((t) => t.category === category)?.price_cents ?? null,
}));

const insertRegistrationMock = vi.fn();
const updateRegistrationMock = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
const insertRegistrantsMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({
  from: (table: string) => {
    if (table === "registrations") {
      return {
        insert: insertRegistrationMock,
        update: updateRegistrationMock,
      };
    }
    if (table === "registrants") {
      return {
        insert: insertRegistrantsMock,
      };
    }
    throw new Error(`unexpected table ${table}`);
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: createServiceClientMock,
}));

const checkoutSessionsCreateMock = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    checkout: { sessions: { create: checkoutSessionsCreateMock } },
  }),
}));

beforeEach(() => {
  getActiveEditionMock.mockReset();
  getActivePricingMock.mockReset();
  insertRegistrationMock.mockReset();
  insertRegistrantsMock.mockReset();
  checkoutSessionsCreateMock.mockReset();
});

describe("POST /api/register", () => {
  it("re-prices every registrant server-side and never trusts a client-supplied price", async () => {
    getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
    getActivePricingMock.mockResolvedValue([
      { category: "adult", price_cents: 12500 },
      { category: "young_adult", price_cents: 10000 },
    ]);
    insertRegistrationMock.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "reg-1" }, error: null }),
      }),
    });
    insertRegistrantsMock.mockResolvedValue({ error: null });
    checkoutSessionsCreateMock.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });

    const { POST } = await import("../../../app/api/register/route");
    const request = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        registrationType: "individual",
        churchName: null,
        contactName: "Jane Doe",
        contactEmail: "jane@example.com",
        contactPhone: "",
        // Client claims a price of $1 — the route must ignore this entirely.
        registrants: [{ fullName: "Jane Doe", category: "adult", price_cents: 100 }],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123" });

    // The Stripe line item must use the server-looked-up price (12500), not the client's (100).
    const createArgs = checkoutSessionsCreateMock.mock.calls[0][0];
    expect(createArgs.line_items).toEqual([
      expect.objectContaining({
        price_data: expect.objectContaining({ unit_amount: 12500 }),
        quantity: 1,
      }),
    ]);

    // The registrants insert must also carry the server-computed price, not the client's.
    const insertedRegistrants = insertRegistrantsMock.mock.calls[0][0];
    expect(insertedRegistrants).toEqual([
      expect.objectContaining({ full_name: "Jane Doe", category: "adult", price_cents: 12500 }),
    ]);
  });

  it("returns 409 when no current/upcoming edition is open for registration", async () => {
    getActiveEditionMock.mockResolvedValue(null);

    const { POST } = await import("../../../app/api/register/route");
    const request = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        registrationType: "individual",
        churchName: null,
        contactName: "Jane Doe",
        contactEmail: "jane@example.com",
        contactPhone: "",
        registrants: [{ fullName: "Jane Doe", category: "adult" }],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  it("returns 400 when a registrant's category has no active price", async () => {
    getActiveEditionMock.mockResolvedValue({ id: "edition-1", year: 2027 });
    getActivePricingMock.mockResolvedValue([{ category: "adult", price_cents: 12500 }]);

    const { POST } = await import("../../../app/api/register/route");
    const request = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        registrationType: "individual",
        churchName: null,
        contactName: "Jane Doe",
        contactEmail: "jane@example.com",
        contactPhone: "",
        registrants: [{ fullName: "Jane Doe", category: "young_adult" }],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `app/api/register/route.ts` does not exist.

- [ ] **Step 5: Write the minimal implementation**

Create `app/api/register/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition, priceForCategory, type RegistrantCategory } from "@/lib/pricing";
import { getStripeClient } from "@/lib/stripe";

type RegisterRequestBody = {
  registrationType: "individual" | "group";
  churchName: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  registrants: { fullName: string; category: RegistrantCategory }[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterRequestBody;
  const supabase = createServiceClient();

  const edition = await getActiveEdition(supabase);

  if (!edition) {
    return NextResponse.json({ error: "Registration is not open" }, { status: 409 });
  }

  const tiers = await getActivePricingForEdition(supabase, edition.id);

  const pricedRegistrants: { full_name: string; category: RegistrantCategory; price_cents: number }[] = [];
  for (const registrant of body.registrants) {
    const price = priceForCategory(tiers, registrant.category);
    if (price === null) {
      return NextResponse.json(
        { error: `No active price for category ${registrant.category}` },
        { status: 400 }
      );
    }
    pricedRegistrants.push({
      full_name: registrant.fullName,
      category: registrant.category,
      price_cents: price,
    });
  }

  const totalAmountCents = pricedRegistrants.reduce((sum, r) => sum + r.price_cents, 0);

  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .insert({
      edition_id: edition.id,
      registration_type: body.registrationType,
      church_name: body.churchName,
      contact_name: body.contactName,
      contact_email: body.contactEmail,
      contact_phone: body.contactPhone || null,
      total_amount_cents: totalAmountCents,
    })
    .select()
    .single();

  if (registrationError || !registration) {
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 });
  }

  const { error: registrantsError } = await supabase
    .from("registrants")
    .insert(
      pricedRegistrants.map((r) => ({
        registration_id: registration.id,
        full_name: r.full_name,
        category: r.category,
        price_cents: r.price_cents,
      }))
    );

  if (registrantsError) {
    return NextResponse.json({ error: "Failed to create registrants" }, { status: 500 });
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: pricedRegistrants.map((r) => ({
      price_data: {
        currency: "usd",
        unit_amount: r.price_cents,
        product_data: { name: `CACNA Convention registration — ${r.full_name} (${r.category})` },
      },
      quantity: 1,
    })),
    customer_email: body.contactEmail,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/register/confirmation?registration=${registration.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/register`,
    metadata: { registration_id: registration.id },
  });

  await supabase
    .from("registrations")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", registration.id);

  return NextResponse.json({ checkoutUrl: session.url });
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Wire the real submit handler**

Modify `components/register/RegisterPageClient.tsx`'s `handleSubmit` function:

```tsx
async function handleSubmit(payload: RegistrationPayload) {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // A real error-message UI is a reasonable future enhancement; for now,
    // surface the failure clearly rather than silently doing nothing.
    alert("Registration failed. Please try again or contact us.");
    return;
  }

  const { checkoutUrl } = await response.json();
  window.location.href = checkoutUrl;
}
```

Remove the now-unused `editionId` prop plumbing only if nothing else in the component reads it — check first, since the component signature (`{ editionId }`) may still be needed by the page for other purposes; if `editionId` is genuinely unused after this change, remove it from both `RegisterPageClient`'s props and `app/(site)/[locale]/register/page.tsx`'s call site, and update any test that passes it.

- [ ] **Step 8: Run the full suite and build**

Run: `npm test` — expect PASS.
Run: `npm run build` — expect success.

- [ ] **Step 9: Commit**

```bash
git add lib/stripe.ts app/api/register/route.ts components/register/RegisterPageClient.tsx tests/app/api/register.test.ts package.json package-lock.json
git commit -m "Add Stripe checkout API route with server-validated pricing"
```

---

### Task 7: Stripe webhook handler

**Files:**
- Create: `app/api/stripe/webhook/route.ts`
- Test: `tests/app/api/stripe-webhook.test.ts`

**Interfaces:**
- Consumes: `getStripeClient` (Task 6), `createServiceClient` (Foundation Task 3).
- Produces: `POST /api/stripe/webhook` — verifies the Stripe signature, and on `checkout.session.completed` marks the matching `registrations` row `status: "paid"` and stores `stripe_payment_intent_id`; on `payment_intent.payment_failed`, marks `status: "failed"`.

- [ ] **Step 1: Write the failing test**

Create `tests/app/api/stripe-webhook.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const constructEventMock = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    webhooks: { constructEvent: constructEventMock },
  }),
}));

const updateMock = vi.fn();
const eqMock = vi.fn(() => Promise.resolve({ error: null }));
const createServiceClientMock = vi.fn(() => ({
  from: () => ({
    update: (patch: unknown) => {
      updateMock(patch);
      return { eq: eqMock };
    },
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: createServiceClientMock,
}));

beforeEach(() => {
  constructEventMock.mockReset();
  updateMock.mockReset();
  eqMock.mockClear();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

describe("POST /api/stripe/webhook", () => {
  it("marks a registration paid on checkout.session.completed", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          payment_intent: "pi_test_123",
          metadata: { registration_id: "reg-1" },
        },
      },
    });

    const { POST } = await import("../../../app/api/stripe/webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig_test" },
      body: "raw-body",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "paid", stripe_payment_intent_id: "pi_test_123" })
    );
    expect(eqMock).toHaveBeenCalledWith("id", "reg-1");
  });

  it("marks a registration failed on payment_intent.payment_failed", async () => {
    constructEventMock.mockReturnValue({
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: "pi_test_456",
          metadata: { registration_id: "reg-2" },
        },
      },
    });

    const { POST } = await import("../../../app/api/stripe/webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig_test" },
      body: "raw-body",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: "failed" }));
    expect(eqMock).toHaveBeenCalledWith("id", "reg-2");
  });

  it("returns 400 when signature verification fails", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const { POST } = await import("../../../app/api/stripe/webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "bad_sig" },
      body: "raw-body",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `app/api/stripe/webhook/route.ts` does not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `app/api/stripe/webhook/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";
import { requireEnv } from "@/lib/env";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature") ?? "";
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; payment_intent: string; metadata?: { registration_id?: string } };
    const registrationId = session.metadata?.registration_id;
    if (registrationId) {
      await supabase
        .from("registrations")
        .update({ status: "paid", stripe_payment_intent_id: session.payment_intent })
        .eq("id", registrationId);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as { id: string; metadata?: { registration_id?: string } };
    const registrationId = paymentIntent.metadata?.registration_id;
    if (registrationId) {
      await supabase.from("registrations").update({ status: "failed" }).eq("id", registrationId);
    }
  }

  return NextResponse.json({ received: true });
}
```

Note: `payment_intent.payment_failed` events carry `metadata` from the PaymentIntent, not the Checkout Session — Stripe copies `metadata` from a Checkout Session onto its underlying PaymentIntent automatically when `payment_intent_data.metadata` isn't separately set, which is the default behavior your Checkout Session creation in Task 6 relies on (it sets top-level `metadata`, not `payment_intent_data.metadata`). This is called out here because it's the kind of Stripe-specific behavior that's easy to get wrong; Task 9's real end-to-end test is what actually proves this works, not this mocked test.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/stripe/webhook/route.ts tests/app/api/stripe-webhook.test.ts
git commit -m "Add Stripe webhook handler for payment status updates"
```

---

### Task 8: Confirmation page and registration promo banners

**Files:**
- Create: `app/(site)/[locale]/register/confirmation/page.tsx`
- Create: `components/register/PromoBanner.tsx`
- Modify: `app/(site)/[locale]/about/page.tsx`, `app/(site)/[locale]/schedule/page.tsx`, `app/(site)/[locale]/plan-your-visit/page.tsx` (mount the banner)
- Modify: `messages/en.json`, `messages/yo.json`
- Test: `tests/components/PromoBanner.test.tsx`

**Interfaces:**
- Consumes: `getActiveEdition` (Task 1), `getActivePricingForEdition`/`priceForCategory` (Task 2).
- Produces: `PromoBanner({ nextDeadline, priceBeforeIncrease }: { nextDeadline: string | null; priceBeforeIncrease: number | null })` — a presentational client component; a server-side helper computes its props (see Step 6). This is the dynamic promo banner design spec §5 calls for and Plan 2 explicitly deferred.

- [ ] **Step 1: Add message keys**

Add to both `messages/en.json` and `messages/yo.json`:

`en.json`:
```json
"PromoBanner": {
  "beforeIncrease": "Adult rate is ${price} through {date} — register now before it goes up.",
  "cta": "Register Now"
},
"RegisterConfirmation": {
  "title": "Thank you for registering!",
  "body": "We've received your registration. A confirmation email is on its way."
}
```

`yo.json`:
```json
"PromoBanner": {
  "beforeIncrease": "Owó Àgbà jẹ́ ${price} títí di {date} — forúkọsílẹ̀ nísisìyí kí ó tó lọ sókè.",
  "cta": "Forúkọsílẹ̀ Nísisìyí"
},
"RegisterConfirmation": {
  "title": "A dúpẹ́ pé o ti forúkọsílẹ̀!",
  "body": "A ti gba ìforúkọsílẹ̀ rẹ. Ímeèlì ìjẹ́rìísí ń bọ̀ wá."
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/components/PromoBanner.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { PromoBanner } from "../../components/register/PromoBanner";
import messages from "../../messages/en.json";

describe("PromoBanner", () => {
  it("renders the price-increase message with a Register CTA", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PromoBanner nextDeadline="2027-01-31" priceBeforeIncrease={12500} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(/125/)).toBeInTheDocument();
    expect(screen.getByText(/2027-01-31/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register Now" })).toBeInTheDocument();
  });

  it("renders nothing when there is no upcoming price increase", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PromoBanner nextDeadline={null} priceBeforeIncrease={null} />
      </NextIntlClientProvider>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `components/register/PromoBanner.tsx` does not exist.

- [ ] **Step 4: Write the minimal implementation**

Create `components/register/PromoBanner.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function PromoBanner({
  nextDeadline,
  priceBeforeIncrease,
}: {
  nextDeadline: string | null;
  priceBeforeIncrease: number | null;
}) {
  const t = useTranslations("PromoBanner");
  const locale = useLocale();

  if (!nextDeadline || priceBeforeIncrease === null) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-[var(--color-brand)] px-6 py-3 text-[var(--color-brand-contrast)]">
      <p>{t("beforeIncrease", { price: (priceBeforeIncrease / 100).toFixed(0), date: nextDeadline })}</p>
      <Link
        href={`/${locale}/register`}
        className="whitespace-nowrap rounded-full bg-[var(--color-brand-contrast)] px-4 py-1 font-medium text-[var(--color-brand)]"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Add a server-side helper to compute the banner's props**

Create the computation inline in each page that mounts the banner (About, Schedule, Plan Your Visit), following this pattern — fetch the active edition and its pricing tiers, find the adult tier whose `ends_on` is soonest in the future, and pass its `price_cents`/`ends_on` to `PromoBanner`:

```tsx
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { PromoBanner } from "@/components/register/PromoBanner";

// Inside the page's async function, after obtaining `supabase`:
const edition = await getActiveEdition(supabase);
let nextDeadline: string | null = null;
let priceBeforeIncrease: number | null = null;

if (edition) {
  const tiers = await getActivePricingForEdition(supabase, edition.id);
  const adultTier = tiers.find((tier) => tier.category === "adult");
  if (adultTier) {
    nextDeadline = adultTier.ends_on;
    priceBeforeIncrease = adultTier.price_cents;
  }
}

// In the JSX, mount once near the top of the page:
// <PromoBanner nextDeadline={nextDeadline} priceBeforeIncrease={priceBeforeIncrease} />
```

Apply this to `app/(site)/[locale]/about/page.tsx`, `app/(site)/[locale]/schedule/page.tsx` (note: Schedule already fetches `edition`/`supabase` — reuse those instead of querying twice), and `app/(site)/[locale]/plan-your-visit/page.tsx`. Since no current/upcoming edition exists yet, the banner renders nothing on all three pages today — that's correct, not a bug, and matches this plan's Global Constraint about the empty state.

- [ ] **Step 7: Add the confirmation page**

Create `app/(site)/[locale]/register/confirmation/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function RegisterConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("RegisterConfirmation");

  return (
    <div className="px-6 py-12 text-center">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-4 text-[var(--color-muted)]">{t("body")}</p>
    </div>
  );
}
```

- [ ] **Step 8: Verify the build**

Run: `npm run build`
Expected: succeeds; `/en/register/confirmation` and `/yo/register/confirmation` both build; About/Schedule/Plan Your Visit pages still build with the (currently invisible) banner mounted.

- [ ] **Step 9: Commit**

```bash
git add app/\(site\)/\[locale\]/register/confirmation components/register/PromoBanner.tsx "app/(site)/[locale]/about/page.tsx" "app/(site)/[locale]/schedule/page.tsx" "app/(site)/[locale]/plan-your-visit/page.tsx" messages/en.json messages/yo.json tests/components/PromoBanner.test.tsx
git commit -m "Add registration confirmation page and dynamic promo banners"
```

---

### Task 9: Wire up real Stripe and Resend

**Files:**
- Modify: `.env.example`
- Modify: `app/api/stripe/webhook/route.ts` (add Resend email send on success)
- Create: `lib/email.ts`
- Test: `tests/lib/email.test.ts`

**Interfaces:**
- Produces: `sendRegistrationConfirmationEmail(to: string, details: {...}): Promise<void>` in `lib/email.ts`, called from the webhook handler after marking a registration paid.

This is the one task in this plan that needs real external accounts. Everything up to here was built and tested against mocks per the user's explicit choice — this task is where that gets wired to reality.

- [ ] **Step 1: Ask the user for credentials**

Before writing any code, ask the user (the human operating this session, not a fictional user) for:
- A Stripe **test-mode** secret key (`sk_test_...`) and, once the webhook endpoint is deployed, a webhook signing secret (`whsec_...`) from the Stripe Dashboard's webhook configuration for `checkout.session.completed` and `payment_intent.payment_failed`.
- A Resend API key.

Do not proceed to Step 2 until you have these, or the user has explicitly told you to stub this task and move on.

- [ ] **Step 2: Update `.env.example`**

Modify `.env.example` to add (documenting, not real values):

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

- [ ] **Step 3: Write the failing test**

Create `tests/lib/email.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}));

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = "re_test";
});

describe("sendRegistrationConfirmationEmail", () => {
  it("sends a confirmation email with the registrant's details", async () => {
    sendMock.mockResolvedValue({ data: { id: "email-1" }, error: null });
    const { sendRegistrationConfirmationEmail } = await import("../../lib/email");

    await sendRegistrationConfirmationEmail("jane@example.com", {
      contactName: "Jane Doe",
      registrantCount: 1,
      totalAmountCents: 12500,
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jane@example.com",
        subject: expect.stringContaining("CACNA Convention"),
      })
    );
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `lib/email.ts` does not exist.

- [ ] **Step 5: Write the minimal implementation**

Create `lib/email.ts`:

```ts
import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

export async function sendRegistrationConfirmationEmail(
  to: string,
  details: { contactName: string; registrantCount: number; totalAmountCents: number }
): Promise<void> {
  const resend = new Resend(requireEnv("RESEND_API_KEY"));

  await resend.emails.send({
    from: "CACNA Convention <registrations@cacnaconvention.org>",
    to,
    subject: "CACNA Convention — Registration Confirmed",
    text: `Hi ${details.contactName},\n\nThank you for registering ${details.registrantCount} attendee(s) for CACNA Convention. Total paid: $${(details.totalAmountCents / 100).toFixed(2)}.\n\nSee you there!`,
  });
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Wire the email into the webhook**

Modify `app/api/stripe/webhook/route.ts`'s `checkout.session.completed` branch to fetch the registration + registrant count after updating status, then call `sendRegistrationConfirmationEmail`:

```ts
if (event.type === "checkout.session.completed") {
  const session = event.data.object as { id: string; payment_intent: string; metadata?: { registration_id?: string } };
  const registrationId = session.metadata?.registration_id;
  if (registrationId) {
    await supabase
      .from("registrations")
      .update({ status: "paid", stripe_payment_intent_id: session.payment_intent })
      .eq("id", registrationId);

    const { data: registration } = await supabase
      .from("registrations")
      .select("contact_email, contact_name, total_amount_cents")
      .eq("id", registrationId)
      .single();
    const { count: registrantCount } = await supabase
      .from("registrants")
      .select("id", { count: "exact", head: true })
      .eq("registration_id", registrationId);

    if (registration) {
      await sendRegistrationConfirmationEmail(registration.contact_email, {
        contactName: registration.contact_name,
        registrantCount: registrantCount ?? 1,
        totalAmountCents: registration.total_amount_cents,
      });
    }
  }
}
```

Add `import { sendRegistrationConfirmationEmail } from "@/lib/email";` to the top of the file. Update `tests/app/api/stripe-webhook.test.ts`'s `checkout.session.completed` test to mock `@/lib/email`'s `sendRegistrationConfirmationEmail` and the additional Supabase `select` calls this introduces, and add an assertion that it's called with the right email/name.

- [ ] **Step 8: Add the real environment variables**

With the credentials from Step 1: add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, and `NEXT_PUBLIC_SITE_URL` (the production URL, `https://cacna-convention.vercel.app` unless a custom domain is in place) to `.env.local` and to the Vercel project for both `production` and `preview` environments — same pattern as Foundation Task 2's Supabase env vars (`printf '%s' "value" | npx --yes vercel env add KEY_NAME production`, repeated for `preview`).

- [ ] **Step 9: Run the full suite and build**

Run: `npm test` — expect PASS.
Run: `npm run build` — expect success.

- [ ] **Step 10: Commit**

```bash
git add .env.example lib/email.ts app/api/stripe/webhook/route.ts tests/lib/email.test.ts tests/app/api/stripe-webhook.test.ts package.json package-lock.json
git commit -m "Wire real Stripe and Resend credentials, send confirmation emails"
```

Do not commit `.env.local` — verify with `git status`/`git check-ignore` before committing, same discipline as every prior task touching secrets.

---

## What this plan does not cover

Real end-to-end manual testing against Stripe's actual test-mode checkout UI (recommended once Task 9 lands, but not a scripted step here since it requires a human to click through a real Stripe-hosted page). The rest of the admin dashboard (viewing registrations, exporting, giving/payments overview beyond registration — that's a separate Give flow per the design spec — schedule editor, gallery upload, editions management) is Plan 5. A real 2027 `convention_editions` row + its `pricing_tiers` must exist before registration is actually usable end-to-end in production — that's an admin action (Plan 5), not something this plan seeds, since 2027's real dates/pricing aren't confirmed yet (design spec §11).
