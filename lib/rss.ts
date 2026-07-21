// Hand-built RSS 2.0 -- same no-dependency approach as lib/videos.ts (this
// project has no `rss`/`feed` package installed). Only the handful of
// elements CACNA's own feed actually needs are supported.

export type RssItem = {
  title: string;
  link: string;
  description?: string | null;
  pubDate?: string | null; // any value `new Date()` can parse; omitted if absent/invalid
  guid: string;
  category?: string; // which source this came from (own site vs. an external feed), so readers can filter
};

export type RssChannel = {
  title: string;
  link: string;
  description: string;
  selfUrl: string;
  language?: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toUTCString();
}

export function buildRssFeed(channel: RssChannel, items: RssItem[]): string {
  const itemsXml = items
    .map((item) => {
      const pubDate = toRfc822(item.pubDate);
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>${
        item.category ? `\n      <category>${escapeXml(item.category)}</category>` : ""
      }${item.description ? `\n      <description>${escapeXml(item.description)}</description>` : ""}${
        pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ""
      }
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>${escapeXml(channel.language ?? "en-us")}</language>
    <atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>
`;
}
