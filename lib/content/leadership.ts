export type LeadershipMember = {
  name: string;
  title: string;
  photo: string;
  bio?: string;
};

export const leadership: LeadershipMember[] = [
  {
    name: "Pastor Timothy Agbeja, Ph.D.",
    title: "Latunde Regional Superintendent, CACNA Chairman, CACNA Coordinating Council Chancellor, CACNA Bible Institute Superintendent, Washington DCC",
    photo: "/photos/people/agbeja.png",
    // Sourced from cacnorthamerica.com/pastor-agbeja (found 2026-07-20).
    bio: "Born in Ilesha, Nigeria, he has served in ministry for over 40 years, pioneering CAC congregations in Miami, New York, and Los Angeles before settling in Washington, D.C.",
  },
  {
    name: "Pastor David Adenodi, Ph.D.",
    title: "Chairman, CACNA Convention Member, CACNA Coordinating Council Provost, CACNA Bible Institute Superintendent, V.O.C -USA, DCC",
    photo: "/photos/people/david-adenodi.jpg",
  },
  {
    name: "Pastor Joseph Olawale",
    title: "Latunde Regional Secretary, CACNA Member, CACNA Coordinating Council Registrar, CACNA Bible Institute Superintendent, Texas DCC",
    photo: "/photos/people/olawale.png",
  },
  {
    name: "Pastor Timothy Adelani",
    title: "Latunde Regional Treasurer, CACNA Member, CACNA Coordinating Council Superintendent, Manhattan NY DCC",
    photo: "/photos/people/adelani.png",
  },
  {
    name: "Pastor John Oluwatimilehin, Ph.D.",
    title: "Chairman, CAC Village Management Council Member, CACNA Coordinating Council Superintendent, Bethel DCC",
    photo: "/photos/people/oluwatimilehin.jpg",
    // Sourced from cacnorthamerica.com/pastor-john-oluwatimilehin-profile (found 2026-07-20).
    bio: "Born in Nigeria and ordained in 1989, he relocated to the U.S. in 1993 and has led CAC Bethel Fellowship in Glenn Dale, Maryland ever since.",
  },
];
