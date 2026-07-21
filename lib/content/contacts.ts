export type ContactRoleKey = "chairman" | "secretary" | "generalInquiries";

export type Contact = {
  name: string;
  roleKey: ContactRoleKey;
  phone: string;
  email: string;
  org: string;
};

export const contacts: Contact[] = [
  {
    name: "Pastor David Adenodi",
    roleKey: "chairman",
    phone: "301-440-7033",
    email: "cacnaconvention@gmail.com",
    org: "C.A.C. Vineyard of Comfort, 6408 Princess Garden Parkway, Lanham, MD 20706",
  },
  {
    // Was "Pastor Timothy Famojuro" -- corrected 2026-07-20. committee.ts
    // already had "Oluwagbemiga Famojuro, D.Min." for the same Secretary
    // role/phone number; cacnorthamerica.com's independently-maintained
    // superintendent roster confirms "Pastor Gbenga Famojuro, D.Min." (Gbenga
    // being the common short form of Oluwagbemiga) at this exact phone
    // number, so "Timothy" was the error, not the other two sources.
    name: "Pastor Oluwagbemiga Famojuro, D.Min.",
    roleKey: "secretary",
    phone: "917-709-1892",
    email: "ftimothy54@aol.com",
    org: "C.A.C. FITA, Brooklyn, NY",
  },
  {
    name: "Pastor Joseph Olawale",
    roleKey: "generalInquiries",
    phone: "305-469-0346",
    email: "cacna@hotmail.com",
    org: "Christ Apostolic Church DFW Metroplex, Sanctuary of Power and Praise, 612 E. 2nd Street, Irving, TX 75060",
  },
];
