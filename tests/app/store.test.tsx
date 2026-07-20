import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import {
  christianEducationMaterials,
  conventionApparelDemo,
  goodWomenApparelDemo,
  youthApparelDemo,
} from "../../lib/content/store-items";

vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("StorePage", () => {
  it("renders the real materials catalog and its shop link", async () => {
    const { default: StorePage } = await import("../../app/(site)/[locale]/store/page");
    const Page = await StorePage({ params: Promise.resolve({ locale: "en" }) });

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

  it("renders each apparel category's demo items, all clearly labeled Demo", async () => {
    const { default: StorePage } = await import("../../app/(site)/[locale]/store/page");
    const Page = await StorePage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Apparel & Merchandise" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Convention Apparel" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Good Women Association Apparel" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Youth & Young Adult Tees" })).toBeInTheDocument();

    const allDemoItems = [...conventionApparelDemo, ...goodWomenApparelDemo, ...youthApparelDemo];
    for (const item of allDemoItems) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }

    // One "Demo" badge per demo item -- never presented as real, purchasable
    // inventory (no Shopify connection is authorized yet).
    expect(screen.getAllByText("Demo")).toHaveLength(allDemoItems.length);
  });
});
