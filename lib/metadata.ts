import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";

/** Builds a page's `<title>`/description/canonical, keeping the locale-aware
 *  canonical-URL construction in one place instead of repeated per page.
 *
 *  Next.js metadata merging replaces `alternates` wholesale rather than
 *  deep-merging it with the root layout's -- so every page that returns its
 *  own `alternates` (i.e. every page using this helper) must redeclare both
 *  the RSS feed link and the hreflang `languages` map here too, or they
 *  silently disappear from that page's <head>. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  /** Path without the locale prefix, e.g. "/about" or "" for the homepage. */
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
    openGraph: { title, description, url: `/${locale}${path}` },
    twitter: { title, description },
  };
}
