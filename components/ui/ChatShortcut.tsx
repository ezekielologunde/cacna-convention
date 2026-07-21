"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

/**
 * Floating "Chat with us" shortcut, site-wide. No AI/LLM behind this --
 * just a fast route to the real contact options already on the Contact
 * page (phone/email per contact, see lib/content/contacts.ts). A future
 * AI-backed assistant would replace this component's behavior, not its
 * position.
 */
export function ChatShortcut() {
  const t = useTranslations("Chat");
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/contact`}
      aria-label={t("openLabel")}
      title={t("openLabel")}
      className="bottom-safe fixed right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-coral)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
      style={{ background: "var(--gradient-cta)" }}
    >
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </Link>
  );
}
