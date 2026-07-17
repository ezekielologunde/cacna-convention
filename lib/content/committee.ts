export type CommitteeMember = {
  role: "Chairman" | "Secretary" | "PRO";
  name: string;
  organization: string;
  phone: string;
};

export const committee: CommitteeMember[] = [
  { role: "Chairman", name: "David Adenodi", organization: "C.A.C Vineyard of Comfort", phone: "301-440-7033" },
  { role: "Secretary", name: "Pastor Timothy Famojuro", organization: "C.A.C. FITA, Brooklyn, NY", phone: "917-709-1892" },
  { role: "PRO", name: "Pastor Yomi Ademuwagun", organization: "CAC Agape Fellowship MD", phone: "443-583-9416" },
];
