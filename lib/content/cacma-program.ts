import type { ScheduleSession } from "./types";

// Transcribed from the 2026 convention program book's "CAC Latunde Region
// Men Association" (CACMA) pages.
export const cacmaSchedule: ScheduleSession[] = [
  {
    dayLabel: "Wednesday, July 15, 2026",
    timeRange: "Early Afternoon Session · 11:45am – 1:15pm",
    agenda: [
      { time: "11:45–11:50am", event: "Opening Prayer", speaker: "Pastor Amos Adetobi" },
      { time: "11:50am–12:00noon", event: "Choruses", speaker: "Available pastor" },
      { time: "12:00–12:45pm", event: "Message — \"Love the Bible, Love God\"", speaker: "Pastor Gabriel S. Dada, Superintendent, CAC Babalola Region" },
      { time: "12:45–1:00pm", event: "Q & A" },
      { time: "1:00–1:10pm", event: "Fund Raising — CACMA", speaker: "Available Supt." },
      { time: "1:10–1:15pm", event: "Prayer and Closing", speaker: "Regional Superintendent" },
    ],
  },
  {
    dayLabel: "Wednesday, July 15, 2026",
    timeRange: "Late Afternoon Session · 3:30 – 5:00pm",
    agenda: [
      { time: "3:30–3:35pm", event: "Opening Prayer", speaker: "Available Member" },
      { time: "3:35–3:45pm", event: "Choruses", speaker: "Available Member" },
      { time: "3:45–4:05pm", event: "Annual Report", speaker: "Pastor Amos Dada" },
      { time: "4:05–4:20pm", event: "Become a Practicing Christian", speaker: "Pastor Amos Dada" },
      { time: "4:20–4:35pm", event: "Financial Report", speaker: "Engr. Sunday Kalejaiye" },
      { time: "4:35–4:45pm", event: "Fund Raising", speaker: "Available Supt." },
      { time: "4:45–5:00pm", event: "Closing Prayer", speaker: "Pastor T.A.O. Agbeja" },
    ],
  },
  {
    dayLabel: "Thursday, July 16, 2026",
    timeRange: "Afternoon Session · 1:00 – 2:15pm",
    agenda: [
      { time: "1:00–1:05pm", event: "Opening Prayer", speaker: "Available Member" },
      { time: "1:05–1:10pm", event: "Choruses", speaker: "Available" },
      { time: "1:10–1:50pm", event: "Message — \"Mobilizing Men to Fulfil Purpose\"", speaker: "Pastor Francis A. Olaniyi, Provost, CAC Theological Seminary" },
      { time: "1:50–1:55pm", event: "Prayer", speaker: "Available Supt." },
      { time: "1:55–2:05pm", event: "Fundraising for CACMA Project", speaker: "Available Supt." },
      { time: "2:05pm", event: "Closing Prayer", speaker: "Pastor S.O. Oladele" },
    ],
  },
];
