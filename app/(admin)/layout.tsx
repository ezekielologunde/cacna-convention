import type { Metadata } from "next";
import { geistSans, geistMono } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "CACNA Convention Admin",
  description: "Admin console for the Christ Apostolic Church North America Convention",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
