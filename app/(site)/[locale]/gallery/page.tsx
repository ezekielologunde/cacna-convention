import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
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
      <PageHero title={t("title")} subtitle={t("intro")} />
      <div className="mx-auto w-full max-w-5xl px-6 py-12 2xl:max-w-6xl">
      <section>
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("conventionHeading")}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {mainGalleryPhotos.map((src, i) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-surface)]"
            >
              <Image
                src={src}
                // No per-photo captions exist to migrate from the source
                // gallery (see lib/content/gallery.ts) -- an honest, generic
                // contextual label beats a fabricated specific one or silence.
                alt={`Photo ${i + 1} of ${mainGalleryPhotos.length} from the 2025 CACNA Convention`}
                fill
                sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-[var(--color-fg)]">{t("childrenHeading")}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {childrenGalleryPhotos.map((src, i) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-surface)]"
            >
              <Image
                src={src}
                alt={`Photo ${i + 1} of ${childrenGalleryPhotos.length} from the 2025 CACNA Convention Children's Department`}
                fill
                sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
