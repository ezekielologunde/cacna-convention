import type { Person, AgendaItem, ConferenceMessage } from "./types";

// Transcribed from the 2026 convention program book's "CACNA Business Group
// Fellowship" page.
export const businessGroupFellowship = {
  title: "CACNA Business Group Fellowship",
  date: "Thursday, July 16, 2026",
  moderators: ["Evangelist (Dr.) Efuntoye", "Evangelist Oyarombi"],
  // Excerpted verbatim from the 2026 program's President's Message (found
  // 2026-07-20 re-crawl, verified directly against the source PDF) -- trimmed
  // one tangential thank-you sentence, wording otherwise unchanged.
  founding:
    "The CAC Business Group Fellowship (CACBGF) was formally inaugurated by the Authority of the Church on Monday 4th of May, 2026 at Ikeji-Arakeji, Osun State. The CAC Business Group Fellowship was formed to support projects and programs of the Church as well as serve as a platform for interaction, mentorship and support of members of our Church who are business-inclined. It is not a policy-making body, pressure group or Authority in the Church.",
};

export const businessGroupAgenda: AgendaItem[] = [
  { time: "11:15–11:20am", event: "Opening Prayer", speaker: "Pastor (Dr.) Mathew Babalola" },
  { time: "11:20–11:30am", event: "Chairman's Speech", speaker: "Pastor Bolaji Oladunni" },
  { time: "11:30–11:35am", event: "Introduction of the Guest Speaker", speaker: "Engineer Ajibola Osinubi" },
  { time: "11:35am–12:05pm", event: "Guest Speaker's Lecture", speaker: "Dr. Jumoke Ojo" },
  { time: "12:05–12:15pm", event: "Questions and Answers", speaker: "Evangelist Janet Olajide" },
  { time: "12:15–12:25pm", event: "Kingdom Partners", speaker: "Evangelist Abikoye" },
  { time: "12:25–12:40pm", event: "Raffle Tickets / Prizes", speaker: "Evangelist Janet Olajide" },
  { time: "12:40–12:45pm", event: "Vote of Thanks", speaker: "Engineer Ajibola Osinubi" },
  { time: "12:45pm–", event: "Introduction of the Regional Superintendent", speaker: "Pastor Gabriel Idowu" },
  { time: "—", event: "Closing Prayer and Benediction", speaker: "Pastor (Dr.) T.O.A. Agbeja" },
];

// Transcribed from the Business Group Fellowship's own program booklet
// (Executive Officers page) -- new information not previously captured
// from the main convention program book.
export const businessGroupExecutives: Person[] = [
  { name: "Pastor Bolaji Oladunni", role: "Chairman" },
  { name: "Engineer Ajibola Osinubi", role: "Vice Chairman" },
  { name: "Evangelist Gbemisola Oluwayimika", role: "Secretary" },
  { name: "Evangelist Olubunmi Otun", role: "Assistant Secretary" },
  { name: "Elder Emmanuel Odetoye", role: "Financial Secretary" },
  { name: "Evangelist Eunice Alabi Oni", role: "Treasurer" },
  { name: "Evangelist Janet Olajide", role: "P.R.O" },
  { name: "Evangelist Adebisi Abikoye", role: "Assistant P.R.O" },
  { name: "Evangelist Wunmi Atomolagun", role: "Assistant P.R.O" },
];

// Transcribed from the same booklet -- a multi-page feature on doing
// business God's way, run across the Business Group Fellowship program,
// with distinct sections signed by three different contributors: Pastor
// T.A.O. Agbeja (Regional Superintendent), Pastor Gabriel Idowu (Supervisor,
// Latunde Region Business Group Fellowship -- whose name signs the piece's
// actual "Conclusion" section), and Pastor Bolaji Oladunni (Chairman,
// Business Group Fellowship, whose first-person testimony appears mid-piece).
// Credited jointly rather than picking one primary author.
// Condensed 2026-07-19 from 17 paragraphs to a short excerpt — this page's
// job is the Fellowship's schedule/agenda, not hosting a sermon-length
// devotional. Full text remains in the printed convention program.
export const kingdomEconomicsMessage: ConferenceMessage = {
  title: "Kingdom Economics: Doing Business God's Way — Representing God at Work",
  verse: "Deuteronomy 8:18",
  contributors: [
    { name: "Pastor T.A.O. Agbeja, Ph.D.", title: "Regional Superintendent, CACNA (Latunde Region)" },
    { name: "Pastor Gabriel Idowu", title: "Supervisor, Latunde Region Business Group Fellowship" },
    { name: "Pastor Bolaji Oladunni", title: "Chairman, Business Group Fellowship" },
  ],
  body: [
    "Most believers think that our God is present only in prayer, worship, and other church related activities, but looking intensely into the Scripture, we quickly come to see that God is interested in ALL the facets of our earthly activities. Our office is a mission field. Our work is a worship center. Our business place is a platform for witness and our trading place is an altar!",
    "\"This Book of the Law shall not depart from your mouth, but you shall meditate in it day and night, that you may observe to do according to all that is written in it. For then you will make your way prosperous, and then you will have good success.\" (Joshua 1:8, NKJV)",
  ],
  fullMessageNote: "The full message is available in the printed convention program.",
};
