// CAC Nigeria & Overseas' worldwide executive leadership -- sourced from
// cacnaconvention.org's speaker/leadership pages (found 2026-07-20 re-crawl).
// Photos exist on the source site for the first three; the other three are
// listed by name/title only, matching how the source site itself presents
// them (no individual photo published).

// Condensed from the 2026 convention program's full "CAC Nigeria & Overseas
// History" page (found 2026-07-20 re-crawl, verified directly against the
// source PDF) -- a worldwide-denomination founding story distinct from (and
// not covered by) CACNA's own regional history.ts or cacnorthamerica.com's
// own /about page, so this doesn't duplicate either.
export const worldwideHistory =
  "Christ Apostolic Church traces its roots to 1918, when a small group of Nigerian believers began meeting as the Faith Tabernacle prayer band. The Great Revival of 1930, led by Apostle Joseph Ayo Babalola at Ilesa, sparked the movement's rapid growth across Nigeria. After several name changes, the church was registered as Christ Apostolic Church in 1943, and has since grown into a global denomination -- CAC Nigeria & Overseas -- operating institutions including Joseph Ayo Babalola University in Ikeji-Arakeji, Osun State.";

export type WorldwideLeader = {
  name: string;
  title: string;
  photo?: string;
  bio?: string;
};

// Bios sourced from each leader's individual profile page on
// cacnorthamerica.com (found 2026-07-20 re-crawl, verified directly).
// No bio for Fasuyi -- his profile page's biography section is
// unfinished/cut off mid-sentence on the source site.
export const worldwideLeadership: WorldwideLeader[] = [
  {
    name: "Pastor S. O. Oladele",
    title: "President, CAC Nigeria & Overseas",
    photo: "/photos/people/oladele.jpg",
    bio: "Born in Ogun State, Nigeria, he entered ministry at 14, trained across Nigeria, the UK, and the U.S., and has served as President, CAC Nigeria & Overseas since 2014.",
  },
  {
    name: "Pastor E. O. Odejobi",
    title: "General Superintendent, CAC Nigeria & Overseas",
    photo: "/photos/people/odejobi.jpg",
    bio: "Born in Nigeria to a pioneer CAC farming family, he trained as an electrician before entering ministry, planted what became CAC Transfiguration Zone, and has served as General Superintendent since 2020.",
  },
  {
    name: "Prophet H. O. Oladeji",
    title: "General Evangelist, CAC Nigeria & Overseas",
    photo: "/photos/people/oladeji.jpg",
    bio: "Born in Osun State, Nigeria, he worked as an auto mechanic before a 1985 vision called him to ministry, and founded the Erio Mountain prayer program in 2003.",
  },
  {
    name: "Pastor E. E. Mapur",
    title: "General Secretary, CAC Nigeria & Overseas",
    bio: "Born in Plateau State, Nigeria, he was called to ministry in 1988, ordained in 1993, and has served as General Secretary since 2014.",
  },
  {
    name: "Pastor J. F. Omitinde",
    title: "Finance Director, CAC Nigeria & Overseas",
    bio: "Born in Ile-Ife, Nigeria, he worked eight years with the Oyo State School Board before joining CAC as Treasurer in 1992 and becoming Finance Director in 2007.",
  },
  {
    name: "Pastor C. S. Fasuyi",
    title: "Missions Director, CAC Nigeria & Overseas",
  },
];
