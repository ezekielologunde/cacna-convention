const CHANNEL_ID = "UC9wwlYWGoII3B5vLtnIvJEw"; // CAC North America (Latunde Region) -- same channel CACNA's own lib/sermons.ts uses
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export interface Video {
  id: string;
  title: string;
  published: string;
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/**
 * Trimmed port of CACNA's lib/sermons.ts -- RSS only, no YOUTUBE_API_KEY
 * path (this project has no key configured and no live-stream detection
 * need on the homepage; /live already handles the live-stream embed).
 */
export async function getRecentVideos(limit = 4): Promise<Video[]> {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);
    const videos: Video[] = [];
    for (const entry of entries) {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
      if (id && title) videos.push({ id, title: decodeXml(title), published: published ?? "" });
    }
    return videos.slice(0, limit);
  } catch {
    return [];
  }
}
