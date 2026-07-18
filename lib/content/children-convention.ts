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

const teachers58 = [
  "Evang. Mrs. J. Adewunmi",
  "Mrs. A. Bankole",
  "Evang. Mrs. I.B. Ajisafe",
  "Evang. Mrs. M. Okusanya",
  "Mrs. G. Omowole",
  "Mrs. C. Odetoye",
  "Mrs. Olajumoke Alaba",
];

const teachers912 = ["Mrs. A. Babs Mala", "Evang. Mrs. S. Oni", "Evang. Mrs. F. Olorunfemi"];

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

// Distinct from `teachers58`/`teachers912` above, which use first-initial
// shorthand as printed in the daily schedule -- this is the flyer's own
// separate "Children's Convention Teachers" roll call, in full names.
export const childrenTeachers: string[] = [
  "Evang. Mrs. Oluwatoyin Oni",
  "Mrs. Adeola Babs Mala",
  "Evang. Mrs. Juliana Adewunmi",
  "Mrs. Gloria Omowole",
  "Evang. Mrs. Iyabo Bolanle Ajisafe",
  "Evang. Mrs. Sumbo Oni",
  "Evang. Mrs. Michelle Okusanya",
  "Mrs. Adeola Bankole",
  "Mrs. Christiana Odetoye",
  "Mrs. Esan",
  "Evang. Mrs. Folasade Olorunfemi",
  "Mrs. Olajumoke Alaba",
  "Mr. Ijaola",
];
