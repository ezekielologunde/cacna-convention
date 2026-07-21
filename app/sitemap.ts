import type { MetadataRoute } from "next";
import { SITE_URL, ROUTES } from "@/lib/site";
import { routing } from "@/i18n/routing";

const WEEKLY = new Set(["/", "/news", "/live", "/schedule"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.flatMap(({ path, priority }) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
      lastModified,
      changeFrequency: WEEKLY.has(path) ? ("weekly" as const) : ("monthly" as const),
      priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${path === "/" ? "" : path}`])
        ),
      },
    }))
  );
}
