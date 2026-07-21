import { describe, it, expect, vi, beforeEach } from "vitest";

const getCacWorldNewsMock = vi.fn();
const getCacnorthBlogPostsMock = vi.fn();
const getCacnorthEventsMock = vi.fn();
vi.mock("@/lib/cacnorth-content", () => ({
  getCacWorldNews: getCacWorldNewsMock,
  getCacnorthBlogPosts: getCacnorthBlogPostsMock,
  getCacnorthEvents: getCacnorthEventsMock,
}));

beforeEach(() => {
  getCacWorldNewsMock.mockReset().mockResolvedValue([]);
  getCacnorthBlogPostsMock.mockReset().mockResolvedValue([]);
  getCacnorthEventsMock.mockReset().mockResolvedValue([]);
});

describe("GET /feed.xml", () => {
  it("serves a well-formed RSS 2.0 document with our own news events", async () => {
    const { GET } = await import("../../../app/feed.xml/route");
    const res = await GET();

    expect(res.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");

    const xml = await res.text();
    expect(xml).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    expect(xml).toContain("<rss version=\"2.0\"");
    // From lib/content/news-events.ts, so it always appears regardless of the mocked external sources.
    expect(xml).toContain("CAC North America 50th Anniversary Celebration");
    expect(xml).toContain("<atom:link href=\"https://cacna-convention.vercel.app/feed.xml\" rel=\"self\"");
  });

  it("merges in external CAC World News, CACNA Blog, and CACNA Events items", async () => {
    getCacWorldNewsMock.mockResolvedValue([
      {
        id: "w1",
        title: "World News Item",
        excerpt: "An excerpt",
        sourceUrl: "https://cacnorthamerica.com/news/w1",
        imageUrl: null,
        publishedAt: "2026-06-01T00:00:00.000Z",
      },
    ]);
    getCacnorthBlogPostsMock.mockResolvedValue([
      {
        id: "b1",
        title: "Blog Post Item",
        slug: "blog-post-item",
        excerpt: "A blog excerpt",
        imageUrl: null,
        publishedAt: "2026-05-01T00:00:00.000Z",
      },
    ]);
    getCacnorthEventsMock.mockResolvedValue([
      {
        id: "e1",
        title: "Regional Event",
        description: "An event",
        eventDate: "2026-08-01T00:00:00.000Z",
        endDate: null,
        location: null,
        eventUrl: "https://cacnorthamerica.com/events/e1",
      },
    ]);

    const { GET } = await import("../../../app/feed.xml/route");
    const xml = await (await GET()).text();

    expect(xml).toContain("World News Item");
    expect(xml).toContain("<link>https://cacnorthamerica.com/news/w1</link>");
    expect(xml).toContain("Blog Post Item");
    expect(xml).toContain("<link>https://cacnorthamerica.com/blog/blog-post-item</link>");
    expect(xml).toContain("Regional Event");
    expect(xml).toContain("<category>CAC World News</category>");
    expect(xml).toContain("<category>CACNA Blog</category>");
    expect(xml).toContain("<category>CACNA Events</category>");
  });

  it("still returns our own items when an external source rejects", async () => {
    getCacWorldNewsMock.mockRejectedValue(new Error("upstream down"));

    const { GET } = await import("../../../app/feed.xml/route");
    const xml = await (await GET()).text();

    expect(xml).toContain("CAC North America 50th Anniversary Celebration");
  });
});
