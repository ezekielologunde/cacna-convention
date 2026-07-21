import type { AgendaItem } from "./types";

// Transcribed from the 2026 convention program book's "CAC North America
// Youth and Young Ministry 2026 Convention Schedule."
export const youthProgram = {
  title: "CAC North America Youth and Young Ministry",
  theme: "Did God Really Say...? Knowing God's Word for Yourself",
  regionalCoordinator: "Pastor Adekunmi Browne",
  // Sourced from cacnorthamerica.com/youth-young-adult/ (found 2026-07-20).
  history:
    "Christ Apostolic Church allowed the togetherness or fellowship of her elites or youths right from her early days. As extra-constitutional organizations formed by young men and women with godly zeal, they operated within the Church under the strict supervision and control of the Church Authority then.",
};

// Speakers for youth sessions are embedded in the `event` text itself
// (e.g. "— Pastor Adekunmi Browne, Regional Youth Coordinator") rather than
// tracked as a separate field, since the source flyer didn't print a
// per-item speaker column the way the other sub-conference schedules do.
export type YouthScheduleDay = { dayLabel: string; agenda: AgendaItem[] };

export const youthSchedule: YouthScheduleDay[] = [
  {
    dayLabel: "Tuesday, July 14",
    agenda: [
      { time: "11:00–11:45am", event: "Opening Prayer & Icebreaker" },
      { time: "11:45am–1:15pm", event: "Morning Session: \"What I Wish I Had Known Before Freshman Year\"" },
      { time: "1:15–3:30pm", event: "Lunch" },
      { time: "3:30–5:00pm", event: "Afternoon Session: Bible Games" },
      { time: "5:00–6:30pm", event: "Dinner" },
    ],
  },
  {
    dayLabel: "Wednesday, July 15",
    agenda: [
      { time: "10:00–11:00am", event: "Praise & Worship and Opening Prayer — CACNA Y&YAM Praise & Worship Team, Prayer Ministry" },
      { time: "11:00–11:30am", event: "Greeting — Pastor Adekunmi Browne, Regional Youth Coordinator; Housekeeping Rules & Icebreaker" },
      { time: "11:30am–1:30pm", event: "Session One — Game: \"Scripture or Cap?\"; Teaching: \"Did God Really Say...? How to Read the Bible for Yourself\"" },
      { time: "1:30–3:00pm", event: "Lunch" },
      { time: "3:00–4:00pm", event: "Session Two: Breakout — Real Men, Real Talk (Becoming Him: Identity) & Real Women, Real Talk (Becoming Her: Identity)" },
      { time: "4:00–5:00pm", event: "Session Three: Panel Discussion — Unmasking and Healing Sexual Brokenness" },
      { time: "5:00–5:30pm", event: "Prayer & Praise Break" },
      { time: "5:30–7:00pm", event: "Dinner" },
      { time: "7:00–9:00pm", event: "Youth Explosion Impartation Service" },
    ],
  },
  {
    dayLabel: "Thursday, July 16",
    agenda: [
      { time: "10:00–10:45am", event: "Praise & Worship and Opening Prayer — CACNA Y&YAM Praise & Worship Team, Prayer Ministry" },
      { time: "10:45–11:15am", event: "Opening Address: \"Did God Really Say...? Knowing God's Word for Yourself\" — Pastor Adekunmi Browne, Regional Coordinator" },
      { time: "11:15–11:30am", event: "Spirit of David — Dance Ministration" },
      { time: "11:30am–1:00pm", event: "Session Four: Workshops! (1) Calling All Creatives (2) iWorship for Psalmists & Levites — Part II (3) Marketplace Ministry" },
      { time: "1:00–2:30pm", event: "Lunch | Annual CACNA Picnic" },
      { time: "2:30–4:00pm", event: "Sports ~ Games ~ Contests" },
      { time: "4:00–5:00pm", event: "Dinner | Teen Mixer | Singles Soirée | Married Women | Married Men" },
      { time: "5:00–8:00pm", event: "CACNA Praise Night!" },
    ],
  },
  {
    dayLabel: "Friday, July 17",
    agenda: [
      { time: "10:00–11:00am", event: "Praise & Worship and Opening Prayer — CACNA Y&YAM Praise & Worship Team, Prayer Ministry" },
      { time: "11:00am–1:00pm", event: "Session Five: Breakout — Teen Talk | Singles Ministry | Marriage Ministry" },
      { time: "1:00–2:30pm", event: "Lunch" },
      { time: "2:30–3:30pm", event: "Session Six: Owning Your Health" },
      { time: "3:30–4:30pm", event: "Session Seven: Bible Jeopardy & Prize Giveaway!" },
      { time: "4:30–5:00pm", event: "Testimonies | Reflection | Prayer" },
      { time: "5:00–6:00pm", event: "Dinner" },
    ],
  },
];
