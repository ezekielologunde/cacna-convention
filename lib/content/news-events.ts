// News & Events content, provided directly by the site owner (2026-07-17)
// rather than scraped from a source page -- same treatment as other
// organizer-provided facts in this project (e.g. the "registration opens
// January 2027" confirmation). The math checks out against this project's
// own founding data (lib/content/history.ts: founded 1976), but the
// specific October 10 date isn't independently published anywhere yet.

export type NewsEvent = {
  title: string;
  date: string; // ISO date (start date for multi-day events)
  endDate?: string; // ISO date, only set for events spanning more than one day
  location?: string; // omitted when the source didn't give one
  description: string;
  highlights?: string[];
  moreInfoUrl?: string;
};

export const newsEvents: NewsEvent[] = [
  {
    title: "CAC North America 50th Anniversary Celebration",
    date: "2026-10-10",
    location: "CAC Village, USA",
    description:
      "Christ Apostolic Church North America celebrates 50 years since its founding in 1976, at CAC Village — the same grounds that host the annual convention.",
    // A real dedicated page for this now exists on cacnorthamerica.com
    // (built and verified 2026-07-19) — link there directly instead of
    // the generic homepage.
    moreInfoUrl: "https://cacnorthamerica.com/events/cacna-50th-anniversary-2026",
  },
  {
    // Transcribed from the 2027 Ministers Retreat flyer (2026-07-17). No
    // venue was given on the flyer itself -- it says "See details on our
    // website" (cacnorthamerica.com, matching the "C.A.C. North America"
    // branding at the top of the flyer), so `location` is left unset
    // rather than guessing it's CAC Village like the annual convention.
    title: "2027 Ministers Retreat",
    date: "2027-03-22",
    endDate: "2027-03-26",
    description: "A time of refreshing, renewal, and equipping for CAC North America ministers.",
    highlights: [
      "Spiritual Refreshment — Be renewed in God's Word and presence.",
      "Unity & Fellowship — Strengthen bonds and build lasting connections.",
      "Empowerment — Be equipped to lead with impact.",
      "Prayer & Intercession — Seek God together for our church and communities.",
    ],
    // A real dedicated page for this now exists on cacnorthamerica.com
    // (built and verified this session) — link there directly instead of
    // the generic homepage.
    moreInfoUrl: "https://cacnorthamerica.com/events/ministers-retreat-2027",
  },
];
