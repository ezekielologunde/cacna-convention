// Transcribed from the 2026 convention program book's "CACNA Business Group
// Fellowship" page.
export const businessGroupFellowship = {
  title: "CACNA Business Group Fellowship",
  date: "Thursday, July 16, 2026",
  moderators: ["Evangelist (Dr.) Efuntoye", "Evangelist Oyarombi"],
};

export type BusinessGroupAgendaItem = { time: string; event: string; handler: string };

export const businessGroupAgenda: BusinessGroupAgendaItem[] = [
  { time: "11:15–11:20am", event: "Opening Prayer", handler: "Pastor (Dr.) Mathew Babalola" },
  { time: "11:20–11:30am", event: "Chairman's Speech", handler: "Pastor Bolaji Oladunni" },
  { time: "11:30–11:35am", event: "Introduction of the Guest Speaker", handler: "Engineer Ajibola Osinubi" },
  { time: "11:35am–12:05pm", event: "Guest Speaker's Lecture", handler: "Dr. Jumoke Ojo" },
  { time: "12:05–12:15pm", event: "Questions and Answers", handler: "Evangelist Janet Olajide" },
  { time: "12:15–12:25pm", event: "Kingdom Partners", handler: "Evangelist Abikoye" },
  { time: "12:25–12:40pm", event: "Raffle Tickets / Prizes", handler: "Evangelist Janet Olajide" },
  { time: "12:40–12:45pm", event: "Vote of Thanks", handler: "Engineer Ajibola Osinubi" },
  { time: "12:45pm–", event: "Introduction of the Regional Superintendent", handler: "Pastor Gabriel Idowu" },
  { time: "—", event: "Closing Prayer and Benediction", handler: "Pastor (Dr.) T.O.A. Agbeja" },
];
