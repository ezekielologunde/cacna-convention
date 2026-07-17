import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PrimaryNav } from "@/components/navigation/PrimaryNav";
import { FooterNav } from "@/components/navigation/FooterNav";
import { geistSans, geistMono } from "@/lib/fonts";
import "../../globals.css";

export const metadata: Metadata = {
  title: "CACNA Convention",
  description: "Christ Apostolic Church North America Convention",
};

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale segment — without this,
  // next-intl's requestLocale resolution reads a dynamic request API and
  // Next.js falls back to on-demand rendering instead of prerendering
  // /en and /yo at build time. See https://next-intl.dev/docs/getting-started/app-router#static-rendering
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale}>
          <PrimaryNav />
          {children}
          <FooterNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
