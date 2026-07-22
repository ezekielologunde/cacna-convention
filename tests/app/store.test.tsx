import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { christianEducationMaterials } from "../../lib/content/store-items";

const STORE_PRODUCTS = [
  { id: "p1", slug: "convention-tshirt-2027", category: "convention", name: "2027 Convention T-Shirt", price_cents: 2000, sizes: ["S", "M", "L"], active: true, sort_order: 1, created_at: "" },
  { id: "p2", slug: "good-women-tee", category: "good_women", name: "Good Women Association Tee", price_cents: 2200, sizes: ["S", "M", "L"], active: true, sort_order: 1, created_at: "" },
  { id: "p3", slug: "youth-tee", category: "youth", name: "Youth & Young Adult Tee", price_cents: 1800, sizes: ["S", "M", "L"], active: true, sort_order: 1, created_at: "" },
];

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

// See tests/app/register.test.tsx for why this shape mocks "no active
// edition" -- RegisterCta (now rendered at the bottom of this page) calls
// createClient()/getActiveEdition() unconditionally on every render.
function mockNoActiveEdition() {
  // Editions chain: .select().in().order().limit().maybeSingle()
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const editionOrderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: editionOrderMock }));

  // store_products chain: .select().eq().order().order() resolves directly
  const secondOrderMock = vi.fn().mockResolvedValue({ data: STORE_PRODUCTS, error: null });
  const firstOrderMock = vi.fn(() => ({ order: secondOrderMock }));
  const eqMock = vi.fn(() => ({ order: firstOrderMock }));

  createClientMock.mockResolvedValue({
    from: (table: string) =>
      table === "store_products" ? { select: () => ({ eq: eqMock }) } : { select: () => ({ in: inMock }) },
  });
}

// `RegisterCta` is itself an async Server Component nested in this page's
// returned JSX (`<RegisterCta locale={locale} />`), which Next's real RSC
// renderer resolves automatically at request time. `@testing-library/react`
// renders with the client reconciler instead, which throws "<RegisterCta> is
// an async Client Component" the moment it reaches an unresolved async
// function component -- confirmed by actually running this suite without
// this shim first. This walks the page's top-level Fragment children, swaps
// the RegisterCta element for its already-awaited output, and leaves
// everything else untouched.
async function resolveRegisterCta(page: React.ReactElement): Promise<React.ReactElement> {
  // Dynamically imported (rather than a static top-level import) so this
  // module -- and its own static `@/lib/supabase/server` import -- only
  // loads after `createClientMock` above has actually been initialized; a
  // static import here would get hoisted ahead of that `const` and throw
  // "Cannot access 'createClientMock' before initialization" the moment the
  // mock factory below runs. Matches the same specifier the page module
  // itself imports, so Vitest's module cache hands back the identical
  // reference used for the `child.type === RegisterCta` check below.
  const { RegisterCta } = await import("../../components/register/RegisterCta");
  const children = React.Children.toArray((page.props as { children?: React.ReactNode }).children);
  const resolved = await Promise.all(
    children.map((child) =>
      React.isValidElement(child) && child.type === RegisterCta
        ? (RegisterCta as unknown as (props: unknown) => Promise<React.ReactElement>)(child.props)
        : child
    )
  );
  return React.cloneElement(page, undefined, ...resolved);
}

vi.mock("next-intl/server", () => {
  const mock = createNextIntlServerMock(messages);
  // RegisterCta calls `getTranslations({ locale, namespace })` (the object
  // form) while every other call site on this page uses the bare-string
  // form `getTranslations("Namespace")`. `createNextIntlServerMock` only
  // understands the string form -- confirmed by actually running this suite
  // first, which threw "namespace.split is not a function" once
  // RegisterCta's call reached it. Normalize both shapes to a namespace
  // string here rather than touching the shared helper.
  return {
    ...mock,
    getTranslations: (arg: string | { namespace: string }) =>
      mock.getTranslations(typeof arg === "string" ? arg : arg.namespace),
  };
});

describe("StorePage", () => {
  it("renders the real materials catalog and its shop link", async () => {
    mockNoActiveEdition();

    const { default: StorePage } = await import("../../app/(site)/[locale]/store/page");
    const Page = await resolveRegisterCta(await StorePage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Store", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Christian Education Materials" })
    ).toBeInTheDocument();

    for (const item of christianEducationMaterials) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }
    // Prices repeat across items ($16.00/$18.00/$20.00 are shared), so use
    // getAllByText rather than getByText for the price column.
    expect(screen.getAllByText("$16.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$18.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$20.00").length).toBeGreaterThan(0);

    expect(
      screen.getByRole("link", { name: new RegExp(`^${messages.Store.shopCta}`) })
    ).toHaveAttribute("href", "https://www.cacnachristianeducation.com/shop");
  });

  it("renders each apparel category's real products from store_products, with add-to-cart controls", async () => {
    mockNoActiveEdition();

    const { default: StorePage } = await import("../../app/(site)/[locale]/store/page");
    const Page = await resolveRegisterCta(await StorePage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Apparel & Merchandise" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Convention Apparel" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Good Women Association Apparel" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Youth & Young Adult Tees" })).toBeInTheDocument();

    for (const product of STORE_PRODUCTS) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    }

    // Real, purchasable inventory now -- an "Add" button per product, no
    // "Demo" badge.
    expect(screen.getAllByRole("button", { name: "Add" })).toHaveLength(STORE_PRODUCTS.length);
    expect(screen.queryByText("Demo")).not.toBeInTheDocument();
  });

  it("renders the RegisterCta band since registration isn't open yet", async () => {
    mockNoActiveEdition();

    const { default: StorePage } = await import("../../app/(site)/[locale]/store/page");
    const Page = await resolveRegisterCta(await StorePage({ params: Promise.resolve({ locale: "en" }) }));

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Join Us at the 2027 Convention" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Registration for the July 12–17, 2027 convention opens in October 2026 — pricing will be posted as soon as it's confirmed."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get notified — view registration" })).toHaveAttribute(
      "href",
      "/en/register"
    );
  });
});
