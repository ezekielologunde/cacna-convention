import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { RegisterCta } from "@/components/register/RegisterCta";
import { mainGalleryPhotos, childrenGalleryPhotos } from "@/lib/content/gallery";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Gallery" });
  return pageMetadata({ locale, path: "/gallery", title: t("title"), description: t("intro") });
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Gallery");

  return (
    <>
      <PageHero title={t("title")} subtitle={t("intro")} photoSrc="/photos/gallery/IMG-20250719-WA0050.jpg" />
      <div className="mx-auto w-full max-w-5xl px-6 py-12 2xl:max-w-6xl">
      <section>
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("conventionHeading")}</h2>
        <div className="mt-4">
          {/* No per-photo captions exist to migrate from the source gallery
              (see lib/content/gallery.ts) -- an honest, generic contextual
              label beats a fabricated specific one or silence. Alt text is
              precomputed here (not a function prop) since ImageLightbox is
              a Client Component -- functions can't cross that boundary. */}
          <ImageLightbox
            photos={mainGalleryPhotos}
            alts={mainGalleryPhotos.map((_, i) => `Photo ${i + 1} of ${mainGalleryPhotos.length} from the 2025 CACNA Convention`)}
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("childrenHeading")}</h2>
        <div className="mt-4">
          <ImageLightbox
            photos={childrenGalleryPhotos}
            alts={childrenGalleryPhotos.map(
              (_, i) =>
                `Photo ${i + 1} of ${childrenGalleryPhotos.length} from the 2025 CACNA Convention Children's Department`
            )}
          />
        </div>
      </section>
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
