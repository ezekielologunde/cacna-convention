// Searchable index for the nav search bar. Built from the site's own real
// content modules (not hand-duplicated copy) so it stays accurate as that
// content changes -- each entry links back to the page the underlying data
// actually renders on. Locale-agnostic: entries hold locale-prefix-free
// paths, and the search UI prepends the active locale when linking.

import { leadership } from "./content/leadership";
import { committee } from "./content/committee";
import { contacts } from "./content/contacts";
import { hotels } from "./content/hotels";
import { newsEvents } from "./content/news-events";
import { christianEducationMaterials } from "./content/store-items";
import { goodWomenConference } from "./content/good-women-conference";
import { ministersWivesConference } from "./content/ministers-wives-conference";
import { christianEducation } from "./content/christian-education-program";
import { businessGroupFellowship } from "./content/business-group-program";
import { youthProgram } from "./content/youth-program";

export type SearchEntry = {
  title: string;
  href: string;
  category: string;
  excerpt?: string;
};

const pages: SearchEntry[] = [
  { title: "Register", href: "", category: "Page", excerpt: "Convention registration — the site's homepage" },
  { title: "About", href: "/about", category: "Page", excerpt: "Our story, mission, leadership, and committee" },
  { title: "Schedule", href: "/schedule", category: "Page", excerpt: "Full convention schedule" },
  { title: "Live", href: "/live", category: "Page", excerpt: "Watch convention services live" },
  { title: "News", href: "/news", category: "Page" },
  { title: "Give", href: "/give", category: "Page" },
  { title: "Store", href: "/store", category: "Page", excerpt: "Christian Education materials and apparel" },
  { title: "Plan Your Visit", href: "/plan-your-visit", category: "Page", excerpt: "Hotels, travel, rules & etiquette" },
  { title: "Gallery", href: "/gallery", category: "Page" },
  { title: "Archive", href: "/archive", category: "Page", excerpt: "Past conventions" },
  { title: "Contact", href: "/contact", category: "Page" },
  { title: "Children's Program", href: "/children", category: "Page" },
  { title: "Good Women Conference", href: "/good-women", category: "Page" },
  { title: "Ministers' Wives Conference", href: "/ministers-wives", category: "Page" },
  { title: "CACMA (Men's Association)", href: "/cacma", category: "Page" },
  { title: "Christian Education", href: "/christian-education", category: "Page" },
  { title: "Business Group Fellowship", href: "/business-group", category: "Page" },
  { title: "Youth & Young Ministry", href: "/youth", category: "Page" },
];

const leadershipEntries: SearchEntry[] = leadership.map((person) => ({
  title: person.name,
  href: "/about",
  category: "Leadership",
  excerpt: person.title,
}));

const committeeEntries: SearchEntry[] = committee.map((person) => ({
  title: person.name,
  href: "/about",
  category: "Committee",
  excerpt: person.role,
}));

const contactEntries: SearchEntry[] = contacts.map((contact) => ({
  title: contact.name,
  href: "/contact",
  category: "Contact",
  excerpt: contact.org,
}));

const hotelEntries: SearchEntry[] = hotels.map((hotel) => ({
  title: hotel.name,
  href: "/plan-your-visit",
  category: "Hotel",
  excerpt: hotel.city,
}));

const newsEntries: SearchEntry[] = newsEvents.map((event) => ({
  title: event.title,
  href: "/news",
  category: "News",
  excerpt: event.description,
}));

const storeEntries: SearchEntry[] = christianEducationMaterials.map((item) => ({
  title: item.name,
  href: "/store",
  category: "Store",
  excerpt: item.price,
}));

const subConferenceEntries: SearchEntry[] = [
  {
    title: goodWomenConference.title,
    href: "/good-women",
    category: "Program",
    excerpt: `${goodWomenConference.leader} — ${goodWomenConference.leaderTitle}`,
  },
  {
    title: ministersWivesConference.title,
    href: "/ministers-wives",
    category: "Program",
    excerpt: `${ministersWivesConference.chairperson} — Chairperson`,
  },
  {
    title: christianEducation.title,
    href: "/christian-education",
    category: "Program",
    excerpt: christianEducation.theme,
  },
  {
    title: businessGroupFellowship.title,
    href: "/business-group",
    category: "Program",
    excerpt: businessGroupFellowship.moderators.join(", "),
  },
  {
    title: youthProgram.title,
    href: "/youth",
    category: "Program",
    excerpt: youthProgram.theme,
  },
];

export const searchIndex: SearchEntry[] = [
  ...pages,
  ...leadershipEntries,
  ...committeeEntries,
  ...contactEntries,
  ...hotelEntries,
  ...newsEntries,
  ...storeEntries,
  ...subConferenceEntries,
];

/** Case-insensitive substring match across title/excerpt/category, ranking
 *  title matches above excerpt-only matches. Deliberately simple (no fuzzy
 *  matching or external dependency) -- the index is small (well under a
 *  few hundred entries) so a linear scan is fast enough at every keystroke. */
export function searchSite(query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const titleMatches: SearchEntry[] = [];
  const otherMatches: SearchEntry[] = [];

  for (const entry of searchIndex) {
    if (entry.title.toLowerCase().includes(q)) {
      titleMatches.push(entry);
    } else if (entry.excerpt?.toLowerCase().includes(q) || entry.category.toLowerCase().includes(q)) {
      otherMatches.push(entry);
    }
  }

  return [...titleMatches, ...otherMatches].slice(0, limit);
}
