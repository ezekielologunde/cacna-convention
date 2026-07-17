export type CommitteeMember = {
  role: "Chairman" | "Secretary" | "PRO";
  name: string;
  organization: string;
  phone: string;
  photo: string;
};

export const committee: CommitteeMember[] = [
  {
    role: "Chairman",
    name: "David Adenodi",
    organization: "C.A.C Vineyard of Comfort",
    phone: "301-440-7033",
    photo: "/photos/people/david-adenodi.jpg",
  },
  {
    role: "Secretary",
    name: "Pastor Timothy Famojuro",
    organization: "C.A.C. FITA, Brooklyn, NY",
    phone: "917-709-1892",
    photo: "/photos/people/famojuro.jpg",
  },
  {
    role: "PRO",
    name: "Pastor Yomi Ademuwagun",
    organization: "CAC Agape Fellowship MD",
    phone: "443-583-9416",
    photo: "/photos/people/ademuwagun.jpg",
  },
];
