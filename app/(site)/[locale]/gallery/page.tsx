import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { mainGalleryPhotos, childrenGalleryPhotos } from "@/lib/content/gallery";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Gallery");

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-center font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <p className="mx-auto mt-3 max-w-[52ch] text-center text-[var(--color-muted)]">{t("intro")}</p>

      <section className="mt-10">
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
  );
}
