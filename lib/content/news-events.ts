// News & Events content, provided directly by the site owner (2026-07-17)
// rather than scraped from a source page -- same treatment as other
// organizer-provided facts in this project (e.g. the "registration opens
// January 2027" confirmation). The math checks out against this project's
// own founding data (lib/content/history.ts: founded 1976), but the
// specific October 10 date isn't independently published anywhere yet.

export type NewsEvent = {
  title: string;
  date: string; // ISO date
  location: string;
  description: string;
};

export const newsEvents: NewsEvent[] = [
  {
    title: "CAC North America 50th Anniversary Celebration",
    date: "2026-10-10",
    location: "CAC Village, USA",
    description:
      "Christ Apostolic Church North America celebrates 50 years since its founding in 1976, at CAC Village — the same grounds that host the annual convention.",
  },
];
