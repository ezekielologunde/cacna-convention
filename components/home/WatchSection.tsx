import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getRecentVideos } from "@/lib/videos";
import { VideoFacade } from "@/components/ui/VideoFacade";

/**
 * Real video content pulled live from CACNA's own YouTube channel (no key
 * needed -- lib/videos.ts is RSS-only). Mirrors the sibling
 * cacnorthamerica.com site's WatchOnline section: click-to-play featured
 * video + a short row of recent uploads. Renders nothing if the feed is
 * ever empty (no fabricated placeholder content).
 */
export async function WatchSection({ locale }: { locale: string }) {
  const t = await getTranslations("Home");
  const videos = await getRecentVideos(4);
  if (!videos.length) return null;

  const [featured, ...recent] = videos;

  return (
    <section className="relative overflow-hidden px-6 py-16 sm:py-20" style={{ background: "var(--gradient-band)" }}>
      <div className="relative mx-auto max-w-5xl 2xl:max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.25em] text-[var(--color-gold)] uppercase">
            {t("watchKicker")}
          </span>
          <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t("watchHeading")}
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-white/80">{t("watchBody")}</p>
        </div>

        <div className="mt-10">
          <VideoFacade videoId={featured.id} title={featured.title} />
        </div>

        {recent.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase">{t("watchMoreHeading")}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {recent.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl p-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
                >
                  {video.title}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href={`/${locale}/live`} className="font-semibold text-white underline underline-offset-4">
            {t("watchCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
