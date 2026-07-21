import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { mainGalleryPhotos } from "@/lib/content/gallery";

// 10 of the 54 real gallery photos (see lib/content/gallery.ts for
// provenance), spaced through the set rather than just the first 10 so the
// strip doesn't just repeat the Gallery teaser card above it on this page.
const MARQUEE_PHOTOS = mainGalleryPhotos.filter((_, i) => i % 5 === 0).slice(0, 10);

function Track({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div aria-hidden={ariaHidden} className="flex flex-none gap-4">
      {MARQUEE_PHOTOS.map((src, i) => (
        <div key={src + i} className="relative h-[150px] w-[220px] flex-none overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
          <Image src={src} alt="" fill sizes="220px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

export async function PhotoMarquee() {
  const t = await getTranslations("Home");
  return (
    <section className="overflow-hidden py-12 sm:py-16" style={{ background: "var(--color-bg)" }}>
      <div className="mb-8 px-6 text-center">
        <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-red-text)] uppercase">
          {t("marqueeKicker")}
        </span>
        <h2 className="mt-2 font-display text-2xl tracking-tight text-[var(--color-fg)] sm:text-3xl">
          {t("marqueeHeading")}
        </h2>
      </div>
      <div className="photo-marquee-outer">
        <div className="photo-marquee-track">
          <Track />
          <Track ariaHidden />
        </div>
      </div>
    </section>
  );
}
