import { Geist, Geist_Mono } from "next/font/google";

// Shared across both root layouts (app/(site)/[locale]/layout.tsx and
// app/(admin)/layout.tsx) so the Geist font loader calls aren't duplicated
// verbatim between the two multiple-root-layouts trees.
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
