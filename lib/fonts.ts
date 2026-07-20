import { Unbounded, Manrope } from "next/font/google";

// Shared across both root layouts (app/(site)/[locale]/layout.tsx and
// app/(admin)/layout.tsx) so the font loader calls aren't duplicated
// verbatim between the two multiple-root-layouts trees.
//
// Bold, geometric display face (Unbounded) paired with Manrope's warm,
// rounded body face -- part of the bold/vibrant visual redesign. The
// Yoruba orthography this site renders needs precomposed dot-below vowels
// (ẹ, ọ -- U+1EB9, U+1ECD) and combining tone-mark accents (grave/acute/
// tilde, U+0300-0304) -- both fonts confirmed to include the "vietnamese"
// subset (Google Fonts buckets this diacritic coverage there, not under
// "latin-ext"), verified by diffing compiled @font-face unicode-range
// output for a modern-browser UA, the same method used for the previous
// Bricolage Grotesque + Plus Jakarta Sans pairing this replaces.
export const displayFont = Unbounded({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
});

export const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});
