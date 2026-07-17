# CACNA Convention — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the shared foundation the rest of the CACNA Convention platform builds on — test tooling, the Supabase database and auth-gated admin pattern, bilingual (English/Yoruba) routing, the design-token/navigation shell, and PWA installability.

**Architecture:** Next.js App Router (already scaffolded at the repo root, deployed to Vercel with auto-deploy on push to `main`) with Supabase for Postgres + Auth + RLS, `next-intl` for locale-prefixed bilingual routing, and Serwist for the service worker. Public pages live under `app/[locale]/...`; the admin console lives under `app/admin/...` outside the locale prefix (internal tool, English-only — see Task 4 note).

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), `next-intl`, `@serwist/next`, Vitest + React Testing Library.

## Plan decomposition

This spec (`docs/superpowers/specs/2026-07-16-cacna-convention-design.md`) covers multiple independent subsystems. This is plan 1 of a sequence — each later plan is written once the ones before it are implemented, so it can build on real code instead of guesses:

1. **Foundation** (this plan) — test tooling, Supabase schema + client, admin auth gate, i18n, nav shell, PWA
2. **Public content pages** — Home, About, Schedule, Plan Your Visit, Archive, Contact, reading from the schema this plan creates
3. **Registration & payments** — individual + church/group registration, Stripe Checkout + webhook
4. **Giving** — separate donation Stripe flow
5. **Admin dashboard features** — registrations list/export, giving overview, schedule editor, gallery upload, editions management
6. **Gallery & live streaming** — Cloudinary integration, live embed

## Global Constraints

- Framework: Next.js App Router on Vercel. Repo already exists at `C:\Users\WT8\Projects\Church\Convention`, pushed to `github.com/ezekielologunde/cacna-convention`, with Vercel auto-deploy wired to `main`.
- Backend: Supabase (Postgres + Auth + RLS). No schema changes applied by hand via the dashboard — every change ships as a committed SQL file under `supabase/migrations/` (design spec §9).
- Bilingual: every **public** page and UI string ships in both English (`en`) and Yoruba (`yo`) via locale-prefixed routes (design spec §7). The admin console is an internal organizer tool and is explicitly out of scope for translation (not contradicted by the spec, which only requires bilingual support for the public site).
- Registration is the dominant call-to-action site-wide (design spec §5) — any task touching navigation/layout must keep the "Register Now" CTA visually dominant over other links.
- No native App Store/Play Store work in this phase — PWA only (design spec §2).
- Design tokens introduced in this plan are structural placeholders, not final brand colors — the real branding pass happens later using the `impeccable` skill (design spec §10). Do not treat any color value in this plan as final.
- Test toolchain is Vitest + React Testing Library (established in Task 1) — every task from Task 2 onward includes tests using this toolchain.
- Commit after every task.

---

### Task 1: Test toolchain (Vitest + React Testing Library)

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Produces: a working `npm test` command (runs `vitest run`), a `tests/` directory as the test root, and a `@/*` path alias inside tests matching the existing `tsconfig.json` alias — every later task's tests rely on this.

- [ ] **Step 1: Write the failing test**

Create `tests/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("test toolchain", () => {
  it("runs a trivial assertion", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `npm error Missing script: "test"` (the script and Vitest itself don't exist yet).

- [ ] **Step 3: Install test dependencies**

Run: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`

- [ ] **Step 4: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 5: Create the Vitest setup file**

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Add the test script**

Modify `package.json` — add `"test": "vitest run"` to the `scripts` block, alongside the existing `dev`/`build`/`start`/`lint` scripts.

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 1 test passed (`tests/smoke.test.ts`).

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts vitest.setup.ts tests/smoke.test.ts package.json package-lock.json
git commit -m "Add Vitest + React Testing Library toolchain"
```

---

### Task 2: Environment validation helper, Supabase project, and initial schema

**Files:**
- Create: `lib/env.ts`
- Create: `.env.example`
- Create: `supabase/migrations/0001_init.sql`
- Create: `types/database.types.ts`
- Test: `tests/lib/env.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `requireEnv(name: string): string` (throws if missing) — used by every Supabase client in Task 3. Produces the `convention_editions` and `admin_profiles` tables and the `Database` type used by Task 3 onward. Exact shape:
  - `convention_editions`: `id, year, theme, starts_on, ends_on, venue_name, venue_address, status ('upcoming'|'current'|'past'), created_at, updated_at` — at most one row may have `status = 'current'` (enforced by a partial unique index).
  - `admin_profiles`: `id (references auth.users), full_name, created_at`.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/env.test.ts`:

```ts
import { describe, it, expect, afterEach } from "vitest";
import { requireEnv } from "../../lib/env";

describe("requireEnv", () => {
  const KEY = "TEST_ONLY_VAR";

  afterEach(() => {
    delete process.env[KEY];
  });

  it("returns the value when the env var is set", () => {
    process.env[KEY] = "hello";
    expect(requireEnv(KEY)).toBe("hello");
  });

  it("throws a descriptive error when the env var is missing", () => {
    expect(() => requireEnv(KEY)).toThrow(
      "Missing required environment variable: TEST_ONLY_VAR"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `lib/env.ts` does not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/env.ts`:

```ts
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 2 tests passed in `tests/lib/env.test.ts`, plus the Task 1 smoke test still passing.

- [ ] **Step 5: Write the initial migration**

Create `supabase/migrations/0001_init.sql`:

```sql
create table convention_editions (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique,
  theme text not null,
  starts_on date not null,
  ends_on date not null,
  venue_name text not null,
  venue_address text not null,
  status text not null check (status in ('upcoming', 'current', 'past')) default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one edition may be "current" at a time.
create unique index one_current_edition
  on convention_editions (status)
  where status = 'current';

create table admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table convention_editions enable row level security;
alter table admin_profiles enable row level security;

create policy "convention_editions readable by everyone"
  on convention_editions for select
  using (true);

create policy "convention_editions writable by admins"
  on convention_editions for all
  using (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()))
  with check (exists (select 1 from admin_profiles where admin_profiles.id = auth.uid()));

create policy "admin_profiles readable by self"
  on admin_profiles for select
  using (id = auth.uid());
```

- [ ] **Step 6: Provision the Supabase project and apply the migration**

This step uses the Supabase MCP tools, not the CLI. Ask the user which Supabase organization to create the project in before calling `create_project` (per that tool's own instructions). Then:

1. Call `mcp__claude_ai_Supabase__create_project` with `name: "cacna-convention"` (region: pick the one closest to CAC Village, PA — `us-east-1`), after calling `confirm_cost` as that tool requires.
2. Once the project is `ACTIVE` (poll with `get_project`), call `mcp__claude_ai_Supabase__apply_migration` with the contents of `supabase/migrations/0001_init.sql`.
3. Call `mcp__claude_ai_Supabase__list_tables` and confirm `convention_editions` and `admin_profiles` are both present.
4. Call `mcp__claude_ai_Supabase__get_project_url` and `mcp__claude_ai_Supabase__get_publishable_keys` to get the project URL and anon key.

- [ ] **Step 7: Wire environment variables**

Create `.env.example` (committed, documents required vars — no real secrets):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Create `.env.local` (already gitignored) with the real values from Step 6 for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Get `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard (Project Settings → API — the MCP tools intentionally don't expose service-role keys) and add it to `.env.local` too.

Add all three to the Vercel project so the deployed site can reach Supabase:

```bash
npx --yes vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx --yes vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx --yes vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

(Each prompts for the value on stdin — paste the corresponding value from `.env.local`.) Repeat for the `preview` environment so PR/branch deploys work too.

- [ ] **Step 8: Add the database types**

Create `types/database.types.ts`:

```ts
export type Database = {
  public: {
    Tables: {
      convention_editions: {
        Row: {
          id: string;
          year: number;
          theme: string;
          starts_on: string;
          ends_on: string;
          venue_name: string;
          venue_address: string;
          status: "upcoming" | "current" | "past";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year: number;
          theme: string;
          starts_on: string;
          ends_on: string;
          venue_name: string;
          venue_address: string;
          status?: "upcoming" | "current" | "past";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["convention_editions"]["Insert"]>;
      };
      admin_profiles: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
      };
    };
  };
};
```

This is hand-written to match the migration above. After Step 6 applies the migration, optionally regenerate it from the live schema with `mcp__claude_ai_Supabase__generate_typescript_types` and diff against this file — they should match.

- [ ] **Step 9: Commit**

```bash
git add lib/env.ts .env.example supabase/migrations/0001_init.sql types/database.types.ts tests/lib/env.test.ts
git commit -m "Add env validation helper and initial Supabase schema"
```

Do not `git add .env.local` — it's gitignored and must stay that way (real secrets).

---

### Task 3: Supabase client library

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Test: `tests/lib/supabase-server.test.ts`
- Test: `tests/lib/supabase-client.test.ts`

**Interfaces:**
- Consumes: `requireEnv` from `lib/env.ts` (Task 2), `Database` type from `types/database.types.ts` (Task 2).
- Produces: `createClient(): Promise<SupabaseClient<Database>>` (SSR, cookie-based, RLS-respecting) and `createServiceClient(): SupabaseClient<Database>` (service-role, bypasses RLS) from `lib/supabase/server.ts`; `createClient(): SupabaseClient<Database>` (browser) from `lib/supabase/client.ts`. Task 4's `requireAdmin` and every future data-fetching task import from these two files — no other file may call `@supabase/ssr` or `@supabase/supabase-js` directly.

- [ ] **Step 1: Install Supabase packages**

Run: `npm install @supabase/ssr @supabase/supabase-js`

- [ ] **Step 2: Write the failing test for the server client**

Create `tests/lib/supabase-server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const getAllMock = vi.fn(() => []);
const setMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: getAllMock,
    set: setMock,
  })),
}));

const createServerClientMock = vi.fn(() => ({ __client: "server" }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

const createSupabaseJsClientMock = vi.fn(() => ({ __client: "service" }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: createSupabaseJsClientMock,
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  createServerClientMock.mockClear();
  createSupabaseJsClientMock.mockClear();
});

describe("createClient (server, SSR)", () => {
  it("builds a Supabase server client with the configured URL and anon key", async () => {
    const { createClient } = await import("../../lib/supabase/server");
    const client = await createClient();

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({ cookies: expect.any(Object) })
    );
    expect(client).toEqual({ __client: "server" });
  });
});

describe("createServiceClient", () => {
  it("builds a service-role client with the configured URL and service key", async () => {
    const { createServiceClient } = await import("../../lib/supabase/server");
    const client = createServiceClient();

    expect(createSupabaseJsClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-key",
      expect.objectContaining({
        auth: expect.objectContaining({ autoRefreshToken: false, persistSession: false }),
      })
    );
    expect(client).toEqual({ __client: "service" });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `lib/supabase/server.ts` does not exist.

- [ ] **Step 4: Write the minimal implementation**

Create `lib/supabase/server.ts`:

```ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component; safe to ignore because
            // middleware is responsible for refreshing user sessions.
          }
        },
      },
    }
  );
}

export function createServiceClient() {
  return createSupabaseJsClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — both tests in `tests/lib/supabase-server.test.ts` pass.

- [ ] **Step 6: Write the failing test for the browser client**

Create `tests/lib/supabase-client.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const createBrowserClientMock = vi.fn(() => ({ __client: "browser" }));
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: createBrowserClientMock,
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  createBrowserClientMock.mockClear();
});

describe("createClient (browser)", () => {
  it("builds a Supabase browser client with the configured URL and anon key", async () => {
    const { createClient } = await import("../../lib/supabase/client");
    const client = createClient();

    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key"
    );
    expect(client).toEqual({ __client: "browser" });
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `lib/supabase/client.ts` does not exist.

- [ ] **Step 8: Write the minimal implementation**

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all tests pass, including Tasks 1–2's.

- [ ] **Step 10: Commit**

```bash
git add lib/supabase/server.ts lib/supabase/client.ts tests/lib/supabase-server.test.ts tests/lib/supabase-client.test.ts package.json package-lock.json
git commit -m "Add Supabase client library (server, service, browser)"
```

---

### Task 4: Admin auth gate and login page

**Files:**
- Create: `lib/supabase/require-admin.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/page.tsx`
- Test: `tests/lib/require-admin.test.ts`
- Test: `tests/app/admin-login.test.tsx`

**Interfaces:**
- Consumes: `createClient`, `createServiceClient` from `lib/supabase/server.ts` (Task 3); `createClient` from `lib/supabase/client.ts` (Task 3).
- Produces: `requireAdmin(): Promise<{ supabase: SupabaseClient<Database>; user: User }>` — redirects to `/admin/login` (no session) or `/admin/login?error=unauthorized` (session exists but no matching `admin_profiles` row) instead of returning. Every future admin page (Plan 5) calls this at the top of its Server Component.

Admin routes live at `app/admin/...`, outside the `[locale]` segment introduced in Task 5 — the admin console is an internal organizer tool and is not translated (see Global Constraints).

- [ ] **Step 1: Write the failing test**

Create `tests/lib/require-admin.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const getUserMock = vi.fn();
const createClientMock = vi.fn(async () => ({
  auth: { getUser: getUserMock },
}));

const singleMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: singleMock,
      }),
    }),
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
  createServiceClient: createServiceClientMock,
}));

beforeEach(() => {
  redirectMock.mockClear();
  getUserMock.mockReset();
  singleMock.mockReset();
});

describe("requireAdmin", () => {
  it("redirects to /admin/login when there is no authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { requireAdmin } = await import("../../lib/supabase/require-admin");

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("redirects with an unauthorized error when the user has no admin_profiles row", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    singleMock.mockResolvedValue({ data: null });
    const { requireAdmin } = await import("../../lib/supabase/require-admin");

    await expect(requireAdmin()).rejects.toThrow(
      "REDIRECT:/admin/login?error=unauthorized"
    );
  });

  it("returns the service client and user when the admin_profiles row exists", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    singleMock.mockResolvedValue({ data: { id: "user-1" } });
    const { requireAdmin } = await import("../../lib/supabase/require-admin");

    const result = await requireAdmin();
    expect(result.user).toEqual({ id: "user-1" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `lib/supabase/require-admin.ts` does not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/supabase/require-admin.ts`:

```ts
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/admin/login?error=unauthorized");
  }

  return { supabase: service, user };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all three tests in `tests/lib/require-admin.test.ts` pass.

- [ ] **Step 5: Write the failing test for the login page**

Create `tests/app/admin-login.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const signInWithPasswordMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signInWithPassword: signInWithPasswordMock },
  }),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  signInWithPasswordMock.mockReset();
  pushMock.mockReset();
});

describe("AdminLoginPage", () => {
  it("shows an error message when sign-in fails", async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const { default: AdminLoginPage } = await import("../../app/admin/login/page");

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid login credentials")
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("navigates to /admin on successful sign-in", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });
    const { default: AdminLoginPage } = await import("../../app/admin/login/page");

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin"));
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `app/admin/login/page.tsx` does not exist.

- [ ] **Step 7: Write the minimal implementation**

Create `app/admin/login/page.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Admin sign in</h1>
      <label className="flex flex-col gap-1">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      {error ? (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="rounded bg-[var(--color-brand)] px-4 py-2 text-[var(--color-brand-contrast)]"
      >
        Sign in
      </button>
    </form>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test`
Expected: PASS — both tests in `tests/app/admin-login.test.tsx` pass.

- [ ] **Step 9: Add the protected admin landing page**

Create `app/admin/page.tsx`:

```tsx
import { requireAdmin } from "@/lib/supabase/require-admin";

export default async function AdminHomePage() {
  const { user } = await requireAdmin();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-2 text-[var(--color-muted)]">Signed in as {user.email}</p>
    </div>
  );
}
```

This page's behavior is already covered by `require-admin.test.ts` (Step 1) — it's a thin wrapper with no independent logic, so it doesn't get its own test. Its wiring is verified by the build check in Step 10.

- [ ] **Step 10: Verify the build**

Run: `npm run build`
Expected: build succeeds, and the route list includes `/admin`, `/admin/login`.

- [ ] **Step 11: Commit**

```bash
git add lib/supabase/require-admin.ts app/admin/login/page.tsx app/admin/page.tsx tests/lib/require-admin.test.ts tests/app/admin-login.test.tsx
git commit -m "Add admin auth gate and login page"
```

---

### Task 5: Bilingual routing (English/Yoruba)

**Files:**
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `middleware.ts`
- Create: `messages/en.json`
- Create: `messages/yo.json`
- Modify: `next.config.ts`
- Modify: `app/layout.tsx`
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx`
- Delete: `app/page.tsx`
- Test: `tests/i18n/routing.test.ts`
- Test: `tests/i18n/messages.test.ts`

**Interfaces:**
- Produces: `routing` (from `i18n/routing.ts`, `{ locales: ["en", "yo"], defaultLocale: "en" }`) and the `messages/{locale}.json` dictionaries — Task 6's navigation component and every later public-page task read translation keys from these files via `useTranslations`.

**Note on Yoruba text:** the translations in `messages/yo.json` below are a best-effort starting point for scaffolding purposes, not verified by a fluent speaker. Flag them for review by a CACNA organizer before this ships to production — this is tracked as an open item in the design spec (§11).

- [ ] **Step 1: Write the failing test for routing config**

Create `tests/i18n/routing.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { routing } from "../../i18n/routing";

describe("i18n routing config", () => {
  it("supports English and Yoruba with English as default", () => {
    expect(routing.locales).toEqual(["en", "yo"]);
    expect(routing.defaultLocale).toBe("en");
  });
});
```

- [ ] **Step 2: Write the failing test for message parity**

Create `tests/i18n/messages.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import en from "../../messages/en.json";
import yo from "../../messages/yo.json";

function keys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return keys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe("translation message parity", () => {
  it("has exactly the same keys in en.json and yo.json", () => {
    expect(keys(yo).sort()).toEqual(keys(en).sort());
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `i18n/routing.ts`, `messages/en.json`, `messages/yo.json` don't exist.

- [ ] **Step 4: Install next-intl**

Run: `npm install next-intl`

- [ ] **Step 5: Write the routing config**

Create `i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "yo"],
  defaultLocale: "en",
});
```

- [ ] **Step 6: Write the message dictionaries**

Create `messages/en.json`:

```json
{
  "Nav": {
    "home": "Home",
    "about": "About",
    "schedule": "Schedule",
    "register": "Register",
    "registerCta": "Register Now",
    "live": "Live",
    "give": "Give",
    "planYourVisit": "Plan Your Visit",
    "gallery": "Gallery",
    "archive": "Archive",
    "contact": "Contact"
  },
  "Home": {
    "title": "CACNA Convention",
    "subtitle": "Christ Apostolic Church North America — join us for our national convention."
  }
}
```

Create `messages/yo.json`:

```json
{
  "Nav": {
    "home": "Ilé",
    "about": "Nípa Wa",
    "schedule": "Ìtòlẹ́sẹ̀",
    "register": "Forúkọsílẹ̀",
    "registerCta": "Forúkọsílẹ̀ Nísisìyí",
    "live": "Ìtànkálẹ̀ Ààyè",
    "give": "Ẹ̀bùn",
    "planYourVisit": "Ṣe Ètò Ìbẹ̀wò Rẹ",
    "gallery": "Àwòrán",
    "archive": "Àkójọpọ̀ Àtijọ́",
    "contact": "Kàn Sí Wa"
  },
  "Home": {
    "title": "Àpéjọ CACNA",
    "subtitle": "Ìjọ Aposteli Kristi ní Àríwá Amẹ́ríkà — ẹ dara pọ̀ mọ́ wa fún àpéjọ orílẹ̀-èdè wa."
  }
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — both `tests/i18n/routing.test.ts` and `tests/i18n/messages.test.ts` pass.

- [ ] **Step 8: Write the request config**

Create `i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 9: Write the middleware**

Create `middleware.ts`:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
```

The matcher excludes `/admin` so the unlocalized admin console (Task 4) isn't rewritten by the locale middleware.

- [ ] **Step 10: Wire the next-intl plugin into next.config.ts**

Modify `next.config.ts`:

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 11: Make the root layout locale-agnostic**

Modify `app/layout.tsx` to the minimal root shell every route (including `/admin`) shares. Keep the existing Geist font loading here (not per-locale) — `app/globals.css`'s `@theme inline` block references `var(--font-geist-sans)`/`var(--font-geist-mono)`, which only exist when this loader runs, so dropping it would silently break the font for every page:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CACNA Convention",
  description: "Christ Apostolic Church North America Convention",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

This is a baseline fallback title/description — later plans add per-locale, per-page metadata via `generateMetadata` that overrides it.

- [ ] **Step 12: Add the locale-aware nested layout and home page**

Create `app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

Create `app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-4 max-w-md text-lg text-[var(--color-muted)]">{t("subtitle")}</p>
    </div>
  );
}
```

Delete `app/page.tsx` (superseded by `app/[locale]/page.tsx`).

- [ ] **Step 13: Verify the build and routes**

Run: `npm run build`
Expected: build succeeds; route list includes `/[locale]`, `/[locale]/page`, `/admin`, `/admin/login`, with `/en` and `/yo` both statically generated.

- [ ] **Step 14: Commit**

```bash
git add i18n messages middleware.ts next.config.ts app/layout.tsx app/[locale] tests/i18n
git rm app/page.tsx
git commit -m "Add bilingual (English/Yoruba) locale routing"
```

---

### Task 6: Design tokens and primary navigation

**Files:**
- Modify: `app/globals.css`
- Create: `components/navigation/PrimaryNav.tsx`
- Modify: `app/[locale]/layout.tsx`
- Test: `tests/components/PrimaryNav.test.tsx`

**Interfaces:**
- Consumes: `messages/en.json` `Nav` keys (Task 5) via `useTranslations("Nav")`; `useLocale()` from `next-intl`.
- Produces: the `PrimaryNav` component, rendered from `app/[locale]/layout.tsx` above `{children}` on every public page from this point forward.

- [ ] **Step 1: Add design tokens**

Modify `app/globals.css` — add brand token variables to the existing `:root` block (these are placeholders per Global Constraints, not final brand colors):

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --color-bg: #ffffff;
  --color-fg: #17171a;
  --color-brand: #7c3aed;
  --color-brand-contrast: #ffffff;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/components/PrimaryNav.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { PrimaryNav } from "../../components/navigation/PrimaryNav";
import messages from "../../messages/en.json";

function renderNav() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PrimaryNav />
    </NextIntlClientProvider>
  );
}

describe("PrimaryNav", () => {
  it("renders the five primary nav items", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Schedule" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Live" })).toBeInTheDocument();
  });

  it("renders a dominant Register Now CTA and a secondary Give button", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Register Now" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Give" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `components/navigation/PrimaryNav.tsx` does not exist.

- [ ] **Step 4: Write the minimal implementation**

Create `components/navigation/PrimaryNav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const PRIMARY_ITEMS = [
  { key: "home", href: "" },
  { key: "about", href: "/about" },
  { key: "schedule", href: "/schedule" },
  { key: "register", href: "/register" },
  { key: "live", href: "/live" },
] as const;

export function PrimaryNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-6 border-b border-[var(--color-border)] px-6 py-4"
    >
      <ul className="flex items-center gap-6">
        {PRIMARY_ITEMS.map((item) => (
          <li key={item.key}>
            <Link href={`/${locale}${item.href}`}>{t(item.key)}</Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/${locale}/register`}
        className="ml-auto rounded-full bg-[var(--color-brand)] px-5 py-2 font-medium text-[var(--color-brand-contrast)]"
      >
        {t("registerCta")}
      </Link>
      <Link
        href={`/${locale}/give`}
        className="rounded-full border border-[var(--color-border)] px-5 py-2 font-medium"
      >
        {t("give")}
      </Link>
    </nav>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — both tests in `tests/components/PrimaryNav.test.tsx` pass.

- [ ] **Step 6: Mount the nav in the locale layout**

Modify `app/[locale]/layout.tsx` to render `PrimaryNav` above `{children}`:

```tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PrimaryNav } from "@/components/navigation/PrimaryNav";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale}>
      <PrimaryNav />
      {children}
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css components/navigation/PrimaryNav.tsx app/[locale]/layout.tsx tests/components/PrimaryNav.test.tsx
git commit -m "Add design tokens and primary navigation"
```

---

### Task 7: PWA installability

**Files:**
- Create: `app/manifest.ts`
- Create: `public/icons/icon.svg`
- Create: `app/sw.ts`
- Modify: `next.config.ts`
- Test: `tests/manifest.test.ts`

**Interfaces:**
- Produces: an installable manifest at `/manifest.webmanifest` and a generated service worker at `public/sw.js` — no other task in this plan depends on these, but every future page benefits from the resulting installability.

- [ ] **Step 1: Write the failing test**

Create `tests/manifest.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import manifest from "../app/manifest";

describe("PWA manifest", () => {
  it("declares a standalone, installable app", () => {
    const result = manifest();
    expect(result.display).toBe("standalone");
    expect(result.name).toBe("CACNA Convention");
    expect(result.icons?.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `app/manifest.ts` does not exist.

- [ ] **Step 3: Add a placeholder icon**

Create `public/icons/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#7c3aed"/><text x="256" y="320" font-family="Arial, sans-serif" font-size="240" fill="#ffffff" text-anchor="middle">C</text></svg>
```

This is a structural placeholder (matches the placeholder brand color from Task 6) — real branded icons come out of the design/polish pass (spec §10).

- [ ] **Step 4: Write the minimal implementation**

Create `app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CACNA Convention",
    short_name: "CACNA",
    description: "Christ Apostolic Church North America Convention",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — `tests/manifest.test.ts` passes.

- [ ] **Step 6: Install Serwist and add the service worker**

Run: `npm install @serwist/next serwist`

Create `app/sw.ts`:

```ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

- [ ] **Step 7: Wire Serwist into next.config.ts**

Modify `next.config.ts` to compose the Serwist plugin with the existing next-intl plugin:

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(withNextIntl(nextConfig));
```

- [ ] **Step 8: Verify the build generates the service worker**

Run: `npm run build`
Expected: build succeeds and `public/sw.js` exists afterward (check with a file listing — the service worker itself isn't unit-testable in Vitest since it requires a `ServiceWorkerGlobalScope`; its correctness is verified here by the build, and end-to-end by installing the deployed PWA in a browser in a later manual QA pass).

- [ ] **Step 9: Commit**

```bash
git add app/manifest.ts app/sw.ts public/icons/icon.svg next.config.ts tests/manifest.test.ts package.json package-lock.json
git commit -m "Add PWA manifest and service worker"
```

- [ ] **Step 10: Push and confirm the deploy**

```bash
git push
```

Confirm via `mcp__claude_ai_Vercel__list_deployments` (projectId from the earlier `get_project` call, teamId `team_NSpfYQKgcvhzm43aiEE4jQst`) that a new `READY` production deployment was created from this push.

---

## What this plan does not cover

Deliberately out of scope here, picked up by later plans (see "Plan decomposition" above): any actual content pages (About/Schedule/Plan Your Visit/Archive/Contact), registration/payment flows, giving, the rest of the admin dashboard (registrations list, giving overview, schedule editor, gallery upload, editions management), gallery, and live streaming. This plan's deliverable is a deployed, bilingual, installable, database-backed, auth-gated shell with nothing but a placeholder home page — everything else builds on top of it.
