// Single source of truth for the CACNA 50th Anniversary Celebration facts,
// consumed by the News page (via news-events.ts) and every site-wide
// anniversary surface (banner, footer badge, homepage section). English
// only -- not run through next-intl, matching this project's existing
// convention for owner-provided facts (news-events.ts, history.ts, etc.).
export const anniversary = {
  years: 50,
  foundingYear: 1976,
  date: "2026-10-10",
  location: "CAC Village, USA",
  description:
    "Christ Apostolic Church North America celebrates 50 years since its founding in 1976, at CAC Village — the same grounds that host the annual convention.",
  // A real dedicated page for this exists on cacnorthamerica.com (built and
  // verified 2026-07-19) -- link there directly instead of the generic
  // homepage.
  moreInfoUrl: "https://cacnorthamerica.com/events/cacna-50th-anniversary-2026",
};
