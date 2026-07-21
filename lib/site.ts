import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cacna-convention.vercel.app";

export const SITE = {
  name: "CACNA Convention",
  fullName: "Christ Apostolic Church North America Convention",
  description: "Christ Apostolic Church North America Convention",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/icon.png`,
  sameAs: ["https://cacnorthamerica.com/"],
} as const;

/**
 * Public, indexable routes (locale-agnostic paths). Excludes /account and
 * /account/login (personal, not content), /register/confirmation (a
 * post-transaction receipt page, not meant to be discovered/indexed), and
 * /register itself (now just a redirect to "/", which already carries the
 * top sitemap priority -- listing both would be duplicate-content noise).
 */
export const ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/schedule", priority: 0.8 },
  { path: "/plan-your-visit", priority: 0.6 },
  { path: "/give", priority: 0.7 },
  { path: "/news", priority: 0.7 },
  { path: "/live", priority: 0.7 },
  { path: "/gallery", priority: 0.6 },
  { path: "/archive", priority: 0.5 },
  { path: "/contact", priority: 0.6 },
  { path: "/store", priority: 0.5 },
  { path: "/business-group", priority: 0.5 },
  { path: "/cacma", priority: 0.5 },
  { path: "/children", priority: 0.5 },
  { path: "/christian-education", priority: 0.5 },
  { path: "/good-women", priority: 0.5 },
  { path: "/ministers-wives", priority: 0.5 },
  { path: "/youth", priority: 0.5 },
];

/** schema.org Organization graph for the Convention site — a sub-entity of
 *  CACNA (the regional body), representing the Annual Convention itself. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE.name,
        alternateName: SITE.fullName,
        url: SITE_URL,
        logo: SITE.logo,
        description: "The official site for the Christ Apostolic Church North America (CACNA) Annual Convention — schedule, registration, and sub-conference programs.",
        sameAs: SITE.sameAs,
        parentOrganization: {
          "@type": "Organization",
          name: "Christ Apostolic Church North America (CACNA)",
          url: "https://cacnorthamerica.com/",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE.name,
        description: SITE.description,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: routing.locales,
      },
    ],
  };
}

/** schema.org Event for a real, dated Convention edition — pass only when
 *  real starts_on/ends_on/venue data is already in hand (never fabricated). */
export function conventionEventJsonLd(edition: {
  year: number;
  theme?: string | null;
  venue_name?: string | null;
  starts_on: string;
  ends_on: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: edition.theme ? `CACNA ${edition.year} Annual Convention — ${edition.theme}` : `CACNA ${edition.year} Annual Convention`,
    startDate: edition.starts_on,
    endDate: edition.ends_on,
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: edition.venue_name
      ? { "@type": "Place", name: edition.venue_name }
      : undefined,
    organizer: { "@type": "Organization", name: SITE.name, url: SITE_URL },
  };
}
