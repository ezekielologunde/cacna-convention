// Transcribed from the CACNA 2026 Children's Convention Program flyer
// (2026-07-17). The source flyer had two different theme lines mixed
// together, apparently from two separate printings -- the site owner
// confirmed "God's Message to Children" (Mark 10:14) is the correct one.
export const childrenConvention = {
  theme: "God's Message to Children",
  themeVerse: "Mark 10:14",
  coordinator: "Evangelist Mrs. Oluwatoyin Oni",
  safetyNote: "The children's safety is our priority.",
  closingNote: "Have a wonderful summer!",
};

export const dailyStructure = [
  { label: "Sign In", morning: "11:30–11:45am", afternoon: "3:30–3:45pm" },
  { label: "Praise and Worship", morning: "11:45am–12:00pm", afternoon: "3:45–4:00pm" },
  { label: "Prayers", morning: "12:00–12:15pm", afternoon: "4:00–4:15pm" },
];

// Single canonical teacher list (2026-07-19) — previously transcribed
// twice: once as first-initial shorthand split by age group (teachers58/
// teachers912, as printed in the daily schedule) and again as a separate
// full-name "Teachers" roll call (childrenTeachers, below), which is the
// same ~10 people typed up in two different formats. Full names are now
// the single source of truth; age-group filters derive from it. The
// Program Coordinator (childrenConvention.coordinator, above) is
// intentionally not repeated here even though the old full-name roll call
// included her. Two names (Esan, Ijaola) have no age-group assignment on
// the source flyer, so they're listed without one rather than guessed.
export type ChildrenTeacher = { name: string; ageRange?: "5–8 yrs" | "9–12 yrs" };

export const childrenTeachers: ChildrenTeacher[] = [
  { name: "Evang. Mrs. Juliana Adewunmi", ageRange: "5–8 yrs" },
  { name: "Mrs. Adeola Bankole", ageRange: "5–8 yrs" },
  { name: "Evang. Mrs. Iyabo Bolanle Ajisafe", ageRange: "5–8 yrs" },
  { name: "Evang. Mrs. Michelle Okusanya", ageRange: "5–8 yrs" },
  { name: "Mrs. Gloria Omowole", ageRange: "5–8 yrs" },
  { name: "Mrs. Christiana Odetoye", ageRange: "5–8 yrs" },
  { name: "Mrs. Olajumoke Alaba", ageRange: "5–8 yrs" },
  { name: "Mrs. Adeola Babs Mala", ageRange: "9–12 yrs" },
  { name: "Evang. Mrs. Sumbo Oni", ageRange: "9–12 yrs" },
  { name: "Evang. Mrs. Folasade Olorunfemi", ageRange: "9–12 yrs" },
  { name: "Mrs. Esan" },
  { name: "Mr. Ijaola" },
];

const teachers58 = childrenTeachers.filter((t) => t.ageRange === "5–8 yrs").map((t) => t.name);
const teachers912 = childrenTeachers.filter((t) => t.ageRange === "9–12 yrs").map((t) => t.name);

export type ChildrenTeacherGroup = { ageRange: string; teachers: string[] };
export type ChildrenSession = {
  time: string;
  message?: string;
  activity?: string;
  teachersByAge?: ChildrenTeacherGroup[];
};
export type ChildrenScheduleDay = {
  dayLabel: string;
  date: string;
  morning?: ChildrenSession;
  afternoon?: ChildrenSession;
};

export const childrenSchedule: ChildrenScheduleDay[] = [
  {
    dayLabel: "Wednesday, July 15",
    date: "2026-07-15",
    morning: {
      time: "11:30am–1:30pm",
      message: "God's love, wisdom, and guidance for children",
      teachersByAge: [
        { ageRange: "5–8 yrs", teachers: teachers58 },
        { ageRange: "9–12 yrs", teachers: teachers912 },
      ],
    },
    afternoon: {
      time: "3:30–5:00pm",
      message: "God's love in helping children navigate life challenges",
      teachersByAge: [
        { ageRange: "5–8 yrs", teachers: teachers58 },
        { ageRange: "9–12 yrs", teachers: teachers912 },
      ],
    },
  },
  {
    dayLabel: "Thursday, July 16",
    date: "2026-07-16",
    morning: {
      time: "11:30am–1:30pm",
      message: "Message Review and Trivia",
      teachersByAge: [
        { ageRange: "5–8 yrs", teachers: teachers58 },
        { ageRange: "9–12 yrs", teachers: teachers912 },
      ],
    },
    afternoon: {
      time: "1:30–5:00pm",
      activity: "Outdoor Games and Water Splash Activities",
    },
  },
  {
    dayLabel: "Friday, July 17",
    date: "2026-07-17",
    morning: {
      time: "10:00am–2:00pm",
      activity: "Question & Answer Session with Prizes",
    },
  },
];
