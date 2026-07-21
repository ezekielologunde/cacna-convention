// News & Events content, provided directly by the site owner (2026-07-17)
// rather than scraped from a source page -- same treatment as other
// organizer-provided facts in this project (e.g. the "registration opens
// January 2027" confirmation). The math checks out against this project's
// own founding data (lib/content/history.ts: founded 1976), but the
// specific October 10 date isn't independently published anywhere yet.

import { anniversary } from "@/lib/content/anniversary";

export type NewsEvent = {
  title: string;
  date: string; // ISO date (start date for multi-day events)
  endDate?: string; // ISO date, only set for events spanning more than one day
  location?: string; // omitted when the source didn't give one
  description: string;
  highlights?: string[];
  moreInfoUrl?: string;
};

// From the Good Women Association's 2026 conference program page (found
// 2026-07-20 re-crawl, verified directly against the source PDF) -- a
// convention-wide save-the-date table, not GWA-specific despite its
// placement on that page. 2027's dates match this project's own
// owner-provided registration data (lib/editions).
export const upcomingConventionDates = [
  { year: 2027, dateRange: "July 12–17" },
  { year: 2028, dateRange: "July 10–15" },
  { year: 2029, dateRange: "July 9–14" },
  { year: 2030, dateRange: "July 15–20" },
];

export const newsEvents: NewsEvent[] = [
  {
    // title stays page-specific framing (not a shared fact); every other
    // field is pulled from the single anniversary.ts source of truth so
    // there's one place to update if a detail ever changes.
    title: "CAC North America 50th Anniversary Celebration",
    date: anniversary.date,
    location: anniversary.location,
    description: anniversary.description,
    moreInfoUrl: anniversary.moreInfoUrl,
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
  {
    // From the Convention Chairman's Welcome Address in the 2026 printed
    // convention program (found 2026-07-20 re-crawl, verified directly
    // against the source PDF).
    title: "Convention Chairman Concludes Two-Decade Tenure",
    date: "2026-07-13",
    endDate: "2026-07-18",
    location: "CAC Village, USA",
    description:
      "In his welcome address at the 2026 convention, Pastor David Adenodi, Ph.D. announced the completion of his tenure as Chairman of Conventions and Conferences after serving since 2000: \"I have fought a good fight, I have finished my course, I have kept the faith\" (2 Timothy 4:7).",
  },
];
