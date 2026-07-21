import { createCacnorthClient } from "@/lib/cacnorth-supabase";

export type CacWorldNewsItem = {
  id: string;
  title: string;
  excerpt: string | null;
  sourceUrl: string;
  imageUrl: string | null;
  publishedAt: string | null;
};

export type CacnorthBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
};

export type CacnorthEvent = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  endDate: string | null;
  location: string | null;
  eventUrl: string | null;
};

export async function getCacWorldNews(limit = 5): Promise<CacWorldNewsItem[]> {
  const supabase = createCacnorthClient();
  const { data, error } = await supabase
    .from("cac_world_news")
    .select("id, title, excerpt, source_url, image_url, published_at")
    .eq("status", "approved")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
  }));
}

// blog_posts has zero rows in cacnorthamerica.com's database as of this
// writing -- that site's visible blog content is not database-backed. This
// is wired up and ready for whenever real rows are added there (same
// "connectable but empty for now" treatment as the Store page's apparel
// section), so it deliberately returns an empty array today rather than
// throwing or being left unbuilt.
export async function getCacnorthBlogPosts(limit = 5): Promise<CacnorthBlogPost[]> {
  const supabase = createCacnorthClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, image_url, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
  }));
}

// events also has zero rows in cacnorthamerica.com's database as of this
// writing -- their site's visible "CACNA 2027 Annual Convention" card is
// hardcoded, not database-backed, same situation as blog_posts above.
// Filters to today-or-later so a stale/past row (however unlikely while
// the table is unused) never shows as "upcoming".
export async function getCacnorthEvents(limit = 5): Promise<CacnorthEvent[]> {
  const supabase = createCacnorthClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, event_date, end_date, location, event_url")
    .eq("published", true)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    endDate: row.end_date,
    location: row.location,
    eventUrl: row.event_url,
  }));
}
