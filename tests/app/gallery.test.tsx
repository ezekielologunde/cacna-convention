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

    // No per-photo captions exist on the source site to migrate, so each
    // image gets an honest, generic positional alt text instead of a
    // fabricated specific one or an empty string.
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(mainGalleryPhotos.length + childrenGalleryPhotos.length);
    expect(screen.getByAltText(`Photo 1 of ${mainGalleryPhotos.length} from the 2025 CACNA Convention`)).toBeInTheDocument();
    expect(
      screen.getByAltText(`Photo 1 of ${childrenGalleryPhotos.length} from the 2025 CACNA Convention Children's Department`)
    ).toBeInTheDocument();
  });
});
