"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube facade -- port of the sibling cacnorthamerica.com
 * site's component of the same name. Real thumbnail via i.ytimg.com, zero
 * iframe cost until interaction, keyboard operable (a real <button>).
 */
export function VideoFacade({ videoId, title, live = false }: { videoId: string; title: string; live?: boolean }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl border-0 bg-black p-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-90"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      {live && (
        <span
          aria-hidden
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-red-deep)] px-3 py-1 text-xs font-bold tracking-wide text-white uppercase"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Live
        </span>
      )}
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--color-red)" className="ml-1">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="absolute right-4 bottom-0 left-4 pb-4 text-left text-sm font-bold text-white">{title}</span>
    </button>
  );
}
