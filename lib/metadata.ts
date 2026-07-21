import type { Metadata } from "next";

/** Builds a page's `<title>`/description/canonical, keeping the locale-aware
 *  canonical-URL construction in one place instead of repeated per page. */
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
    alternates: { canonical: `/${locale}${path}` },
    openGraph: { title, description, url: `/${locale}${path}` },
    twitter: { title, description },
  };
}
