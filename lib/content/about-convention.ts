// Sourced verbatim from cacnaconvention.org's "About CACNA Convention"
// page (see docs/source-content/2026-cacnaconvention-org-content.md for
// provenance). The source page's closing "People of God, the Lord is
// calling us..." paragraph is intentionally not included here -- it's
// the same text used verbatim in the homepage's Welcome section
// (lib/content/welcome.ts), so it only needs to exist once.

export const aboutConvention = {
  // Recovered from a 2017 Wayback Machine snapshot of this same source page
  // (found 2026-07-20 re-crawl, verified directly) -- the lead-in sentence
  // that originally preceded missionStatement below on the source site, not
  // previously captured.
  introSentence:
    "The CACNA Convention is a large meeting of church members with their families coming together for several days to learn, be uplifted through the word of God ministered, talk about their shared work with other Ministers and to make decisions as a group.",
  missionStatement:
    "The CACNA Convention exists to facilitate, extend and enlarge the Great Commission of Christ under the umbrella of Christ Apostolic Church North America. This is achieved through the authority of God's inerrant Word to the glory of God the Father, under the Lordship of Jesus Christ, and by the empowerment of the Holy Spirit.",
  biblicallyBased: [
    "Affirmation of a minimal set of doctrinal beliefs.",
    "Biblical inerrancy is the foundational element.",
    "Churches working together in mutual accountability.",
  ],
  kingdomFocused: [
    "A focus on evangelism and church administration.",
    "Networking and having fellowship with each other for growth and progress.",
    "Striving to resource the needs of CACNA churches rather than to direct their ministries.",
    "Utilizing the resources of the CACNA to maximize the ministry effectiveness of CACNA Ministers.",
  ],
};

export type AboutConvention = typeof aboutConvention;
