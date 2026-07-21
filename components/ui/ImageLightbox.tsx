"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * A thumbnail grid + full-size viewer for a photo set. Uses the native
 * <dialog> element so the full-size view escapes any ancestor's
 * overflow/stacking context for free, rather than a hand-rolled
 * position:fixed overlay.
 */
export function ImageLightbox({ photos, alts }: { photos: string[]; alts: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex === null) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
  }, [openIndex]);

  function showPrev() {
    setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
  }

  function showNext() {
    setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") showPrev();
    if (event.key === "ArrowRight") showNext();
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-surface)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            <Image
              src={src}
              alt={alts[i]}
              fill
              sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onKeyDown={onKeyDown}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/85"
        aria-label={openIndex !== null ? alts[openIndex] : undefined}
      >
        {openIndex !== null && (
          <div className="relative flex h-dvh w-dvw items-center justify-center px-4 sm:px-16">
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
            >
              <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
            </button>
            <div className="relative h-[80vh] w-full max-w-4xl">
              <Image
                src={photos[openIndex]}
                alt={alts[openIndex]}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
            >
              <ChevronRight size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
