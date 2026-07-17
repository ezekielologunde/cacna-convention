import { Archivo_Black, Public_Sans } from "next/font/google";

// Shared across both root layouts (app/(site)/[locale]/layout.tsx and
// app/(admin)/layout.tsx) so the font loader calls aren't duplicated
// verbatim between the two multiple-root-layouts trees.
//
// Public Sans (body) ships broad Latin Extended coverage — including the
// combining diacritics Yoruba orthography needs (ẹ ọ ṣ, tone marks) — which
// matters since every page renders in both English and Yoruba.
export const displayFont = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

export const bodyFont = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});
