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
