// Transcribed from the CAC Latunde Region Good Women Association 2026
// Conference program flyer. The Wednesday-morning session's timing is
// printed clearly and transcribed in full below. The two afternoon
// sessions (Wed 3:30-5pm, Thu 3:30-5pm) are transcribed as an ordered
// run of show without per-item minute timestamps -- the source flyer's
// printed times for those two blocks were inconsistent with their own
// stated session windows (likely a scan/print artifact), so only the
// clearly legible session-level time range is kept rather than
// asserting a precise minute-by-minute breakdown that can't be verified.
export const goodWomenConference = {
  title: "CAC Latunde Region Good Women Association 2026 Conference",
  leader: "Evang. Mrs. Bolanle Mustapha",
  leaderTitle: "CACNAGWA Leader",
};

export type GoodWomenAgendaItem = { time?: string; event: string; speaker?: string };
export type GoodWomenSession = { dayLabel: string; timeRange: string; agenda: GoodWomenAgendaItem[] };

export const goodWomenSchedule: GoodWomenSession[] = [
  {
    dayLabel: "Wednesday, July 15",
    timeRange: "11:45am – 1:15pm",
    agenda: [
      { time: "11:45–11:50am", event: "Moderator's Opening Statement", speaker: "Evang. Bisi Benson" },
      { time: "11:50–11:55am", event: "Opening Prayer", speaker: "Evang. Mrs. Bukola Awosanya" },
      { time: "11:55am–12:00pm", event: "Opening Hymn", speaker: "Evang. Mrs. Funmi Oni" },
      { time: "12:00–12:05pm", event: "CACNAGWA Leader's Address", speaker: "Evang. Mrs. Bolanle Mustapha" },
      { time: "12:05–12:15pm", event: "Special Presentation", speaker: "CACNAGWA Choir" },
      { time: "12:15–1:05pm", event: "Raising Godly Children in Navigating Cultural and Social Challenges" },
      { time: "1:05–1:10pm", event: "Offerings" },
      { time: "1:10–1:15pm", event: "Closing Prayers", speaker: "Evang. Bola Ajisafe" },
    ],
  },
  {
    dayLabel: "Wednesday, July 15",
    timeRange: "3:30 – 5:00pm",
    agenda: [
      { event: "Moderator's Opening Prayers", speaker: "Mrs. Janet Olajide" },
      { event: "Introduction", speaker: "Evang. Mrs. Janet Olajide" },
      { event: "Opening Prayer", speaker: "Pastor Dr. James Fakeye, Ph.D." },
      { event: "Raising Godly Children in Navigating Cultural and Social Challenges (continued)" },
      { event: "Questions Time" },
      { event: "Special Presentation", speaker: "CACNAGWA Drama" },
      { event: "Closing Remarks", speaker: "L/E Bolanle Mustapha" },
      { event: "Closing Prayers & Benediction", speaker: "Pastor Dr. Hezekiah Ilufoye" },
    ],
  },
  {
    dayLabel: "Thursday, July 16",
    timeRange: "3:30 – 5:00pm",
    agenda: [
      { event: "Moderator's Opening Prayers" },
      { event: "Special Presentation", speaker: "CACNAGWA Drama Group" },
      { event: "Reflections on Raising Godly Children in Marriages" },
      { event: "Prayers", speaker: "Evang. Mrs. Omi, Bafunso, Aladetoun, Ojo, Okosun, Benson" },
      { event: "Offerings" },
      { event: "Closing Remarks", speaker: "Pastor Wale Adelegan" },
      { event: "Closing Prayers & Benediction", speaker: "Pastor Dr. Hezekiah Ilufoye" },
    ],
  },
];
