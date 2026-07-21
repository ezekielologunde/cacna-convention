import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
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
          {mainGalleryPhotos.map((src) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-surface)]"
            >
              <Image
                src={src}
                alt=""
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
          {childrenGalleryPhotos.map((src) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-surface)]"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
      </div>
    </>
  );
}
