// Transcribed from the 2026 CAC Latunde Region Convention Ministers' Wives
// Conference program flyer (a clean, clearly printed schedule table).
export const ministersWivesConference = {
  title: "CAC Latunde Region Convention Ministers' Wives Conference",
  chairperson: "Evang./Mrs. Agnes Agbeja",
  secretary: "Evang./Mrs. Toyin Ademuwagun, Esq.",
  executiveMembers: [
    "Evang./Mrs. Agnes Agbeja — Chairperson",
    "Evang./Mrs. Esther Adenodi",
    "Evang./Mrs. Janet Adelani",
    "Evang./Mrs. Beatrice Olawale",
    "Evang./Mrs. Toyin Ademuwagun, Esq. — Secretary",
  ],
};

export type MinistersWivesAgendaItem = { time: string; event: string; speaker: string };
export type MinistersWivesSession = { dayLabel: string; timeRange: string; agenda: MinistersWivesAgendaItem[] };

export const ministersWivesSchedule: MinistersWivesSession[] = [
  {
    dayLabel: "Wednesday, July 15, 2026",
    timeRange: "11:45am – 1:15pm",
    agenda: [
      { time: "11:45–11:50am", event: "Opening Prayer", speaker: "TBD" },
      { time: "11:50–11:55am", event: "Praise & Worship", speaker: "TBD" },
      { time: "11:55am–12:00pm", event: "General Introduction", speaker: "All" },
      { time: "12:00–12:15pm", event: "Welcome Address", speaker: "Evang. Mrs. Agnes Agbeja" },
      { time: "12:15–1:00pm", event: "God's Communication and Purpose — Exodus 3:1-10", speaker: "Mrs. Susanna Oladele" },
      { time: "1:00–1:10pm", event: "Question & Answer", speaker: "General" },
      { time: "1:10–1:15pm", event: "Closing Prayer", speaker: "Mrs. Susanna Oladele" },
    ],
  },
  {
    dayLabel: "Thursday, July 16, 2026",
    timeRange: "1:00pm – 2:15pm",
    agenda: [
      { time: "1:00–1:05pm", event: "Opening Prayer", speaker: "TBD" },
      { time: "1:05–1:10pm", event: "Praise & Worship", speaker: "TBD" },
      { time: "1:10–1:25pm", event: "Share and Care", speaker: "TBD" },
      { time: "1:25–2:00pm", event: "Question & Answer", speaker: "All" },
      { time: "2:00–2:10pm", event: "Prayer", speaker: "All" },
      { time: "2:10–2:15pm", event: "Closing Prayer", speaker: "Mrs. Susanna Oladele" },
    ],
  },
];
