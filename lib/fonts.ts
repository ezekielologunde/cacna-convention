import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

// Shared across both root layouts (app/(site)/[locale]/layout.tsx and
// app/(admin)/layout.tsx) so the font loader calls aren't duplicated
// verbatim between the two multiple-root-layouts trees.
//
// Matches the sibling cacnorthamerica.vercel.app rebuild's own font stack
// exactly (confirmed via getComputedStyle on its live site, 2026-07-21):
// Bricolage Grotesque for headings, Plus Jakarta Sans for body. Both
// fonts' glyph sets were checked directly on fonts.google.com/specimen/.../glyphs
// and confirmed to include the precomposed Yoruba dot-below vowels (ẹ, ọ --
// U+1EB9, U+1ECD) this site's Yoruba content needs, plus the broader
// combining-diacritic coverage Vietnamese's tone-mark system exercises
// (which is why the "vietnamese" subset is what carries this coverage in
// Google Fonts' bucketing, not "latin-ext").
export const displayFont = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
});

export const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});
