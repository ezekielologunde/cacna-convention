import { SITE, SITE_URL } from "@/lib/site";
import { buildRssFeed, type RssItem } from "@/lib/rss";
import { newsEvents } from "@/lib/content/news-events";
import { getCacWorldNews, getCacnorthBlogPosts, getCacnorthEvents } from "@/lib/cacnorth-content";

// Matches the News page's own revalidation window (app/(site)/[locale]/news/page.tsx)
// so the feed never goes noticeably stale relative to what visitors see there.
export const revalidate = 3600;

const NEWS_PAGE_URL = `${SITE_URL}/en/news`;

// Everything the News page renders, aggregated into one feed: our own
// hand-curated events plus the three external sources it pulls from
// cacnorthamerica.com's separate Supabase project (see lib/cacnorth-content.ts).
// Each item is tagged with a <category> naming its source so feed readers can
// filter, since RSS has no first-class notion of "which feed did this come from".
async function collectItems(): Promise<RssItem[]> {
  const [cacWorldNews, blogPosts, cacnorthEvents] = await Promise.all([
    getCacWorldNews().catch(() => []),
    getCacnorthBlogPosts().catch(() => []),
    getCacnorthEvents().catch(() => []),
  ]);

  const items: RssItem[] = [
    ...newsEvents.map((event) => ({
      title: event.title,
      link: event.moreInfoUrl ?? NEWS_PAGE_URL,
      description: event.description,
      pubDate: event.date,
      guid: `cacna-convention-news:${event.title}:${event.date}`,
      category: "CACNA Convention",
    })),
    ...cacWorldNews.map((item) => ({
      title: item.title,
      link: item.sourceUrl,
      description: item.excerpt,
      pubDate: item.publishedAt,
      guid: `cac-world-news:${item.id}`,
      category: "CAC World News",
    })),
    ...blogPosts.map((post) => ({
      title: post.title,
      link: `https://cacnorthamerica.com/blog/${post.slug}`,
      description: post.excerpt,
      pubDate: post.publishedAt,
      guid: `cacna-blog:${post.id}`,
      category: "CACNA Blog",
    })),
    ...cacnorthEvents.map((event) => ({
      title: event.title,
      link: event.eventUrl ?? "https://cacnorthamerica.com/",
      description: event.description,
      pubDate: event.eventDate,
      guid: `cacna-event:${event.id}`,
      category: "CACNA Events",
    })),
  ];

  // Newest first; items with no parseable date sort last rather than crashing the sort.
  items.sort((a, b) => {
    const timeA = a.pubDate ? new Date(a.pubDate).getTime() : NaN;
    const timeB = b.pubDate ? new Date(b.pubDate).getTime() : NaN;
    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;
    return timeB - timeA;
  });

  return items.slice(0, 50);
}

export async function GET() {
  const items = await collectItems();

  const xml = buildRssFeed(
    {
      title: `${SITE.name} News`,
      link: NEWS_PAGE_URL,
      description: `News and events from the ${SITE.fullName}, plus updates from CAC North America.`,
      selfUrl: `${SITE_URL}/feed.xml`,
    },
    items
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
