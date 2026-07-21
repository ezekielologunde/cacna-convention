import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PrimaryNav } from "@/components/navigation/PrimaryNav";
import { FooterNav } from "@/components/navigation/FooterNav";
import { ChatShortcut } from "@/components/ui/ChatShortcut";
import { displayFont, bodyFont } from "@/lib/fonts";
import { SITE, SITE_URL, organizationJsonLd } from "@/lib/site";
import "../../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = `/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE.name, template: `%s — ${SITE.name}` },
    description: SITE.fullName,
    applicationName: SITE.name,
    alternates: {
      canonical: canonicalPath,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
    icons: { icon: "/brand/icon.png", shortcut: "/brand/icon.png", apple: "/brand/icon.png" },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title: SITE.name,
      description: SITE.fullName,
      url: canonicalPath,
      locale: locale === "yo" ? "yo_NG" : "en_US",
      images: [{ url: SITE.logo, width: 512, height: 512, alt: `${SITE.name} logo` }],
    },
    twitter: {
      card: "summary",
      title: SITE.name,
      description: SITE.fullName,
      images: [SITE.logo],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "CACNA",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#c13a22",
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
  const t = await getTranslations("Nav");

  return (
    <html lang={locale} className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          // Static, app-controlled data only. `<` is escaped so no value can
          // ever break out of the <script> element (JSON-LD hardening) —
          // same pattern used on the sibling cacnorthamerica.com site.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }}
        />
        <Script id="theme-init" strategy="afterInteractive">
          {`(function(){try{var t=localStorage.getItem('cacna-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`}
        </Script>
        <NextIntlClientProvider locale={locale}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[var(--color-fg)] focus:shadow-lg"
          >
            {t("skipToContent")}
          </a>
          <PrimaryNav />
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <FooterNav locale={locale} />
          <ChatShortcut />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
