import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

// Shared across both root layouts (app/(site)/[locale]/layout.tsx and
// app/(admin)/layout.tsx) so the font loader calls aren't duplicated
// verbatim between the two multiple-root-layouts trees.
//
// Matches the sibling Christ Apostolic Church site (cacsalvationcenter.org)'s
// font pairing. The Yoruba orthography this site renders needs precomposed
// dot-below vowels (ẹ, ọ -- U+1EB9, U+1ECD) and combining tone-mark accents
// (grave/acute/tilde, U+0300-0304) -- Google Fonts buckets both under the
// "vietnamese" subset rather than "latin-ext" for every font checked here
// (confirmed by diffing the compiled @font-face unicode-range output for
// this exact pairing, and for the Public Sans/Archivo Black pairing this
// replaces, which had the same subset layout). "latin" alone omits them.
export const displayFont = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
});

export const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});
