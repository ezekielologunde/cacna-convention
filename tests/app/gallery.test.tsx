import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { mainGalleryPhotos, childrenGalleryPhotos } from "../../lib/content/gallery";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("GalleryPage", () => {
  it("renders both albums with every photo", async () => {
    const { default: GalleryPage } = await import("../../app/(site)/[locale]/gallery/page");
    const Page = await GalleryPage({ params: Promise.resolve({ locale: "en" }) });

    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>
    );

    expect(screen.getByRole("heading", { name: "2025 Convention" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Children's Department" })).toBeInTheDocument();

    // Photos are intentionally alt="" (decorative to assistive tech): the
    // source site has no per-photo captions, and each grid's adjacent <h2>
    // already names the album, so repeating that same name as alt text on
    // every one of the 61 images would make a screen reader announce it 61
    // times in a row instead of skipping straight past. That means these
    // <img>s don't carry the accessible "img" role -- query by tag instead.
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(mainGalleryPhotos.length + childrenGalleryPhotos.length);
    for (const img of images) {
      expect(img).toHaveAttribute("alt", "");
    }
  });
});
