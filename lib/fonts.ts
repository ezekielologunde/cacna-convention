import { Unbounded, Hanken_Grotesk } from "next/font/google";

// Shared across both root layouts (app/(site)/[locale]/layout.tsx and
// app/(admin)/layout.tsx) so the font loader calls aren't duplicated
// verbatim between the two multiple-root-layouts trees.
//
// Bold, geometric display face (Unbounded) paired with Hanken Grotesk's
// clean, neutral body face -- Hanken Grotesk replaced Manrope
// (2026-07-21) as a quieter workhorse that lets Unbounded carry the
// page's personality. The Yoruba orthography this site renders needs
// precomposed dot-below vowels (ẹ, ọ -- U+1EB9, U+1ECD) and combining
// tone-mark accents (grave/acute/tilde, U+0300-0304) -- both fonts
// confirmed to include the "vietnamese" subset (Google Fonts buckets this
// diacritic coverage there, not under "latin-ext"), verified via each
// font's Google Fonts metadata endpoint (fonts.google.com/metadata/fonts/
// <family>) before picking Hanken Grotesk over Figtree, which lacks it.
export const displayFont = Unbounded({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
});

export const bodyFont = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});
