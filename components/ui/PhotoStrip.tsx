import Image from "next/image";

/**
 * A small real-photo strip for interior pages whose PageHero is otherwise
 * gradient-only. Source photos (lib/content/gallery.ts) are uncaptioned on
 * their own site of origin, so `caption` here is always a general one
 * ("From the 2025 convention") rather than a specific claim about who or
 * what is pictured — never invent a per-photo subject the source doesn't
 * support.
 *
 * Since no per-photo caption exists, the 3 images are treated as one
 * decorative unit (each `alt=""`) with a single accessible name on the
 * group, rather than repeating the same non-empty alt text 3 times in a
 * row -- identical alt text on every image is worse for screen-reader
 * users than marking them decorative, since it reads as 3 redundant
 * announcements instead of 0.
 */
export function PhotoStrip({ photos, caption }: { photos: string[]; caption: string }) {
  if (photos.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-3xl px-6 pt-10 2xl:max-w-5xl">
      <div role="group" aria-label={caption} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((src, i) => (
          <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 45vw, 240px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-[var(--color-muted)]">{caption}</p>
    </section>
  );
}
