"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { anniversary } from "@/lib/content/anniversary";

const DISMISSED_KEY = "cacna-anniversary-banner-dismissed";

// Site-wide announcement bar for the CACNA 50th Anniversary Celebration --
// mounted once in the locale layout, above PrimaryNav, so it shows on every
// page. Dismissal is session-scoped (sessionStorage, not localStorage) so
// the banner reappears on the visitor's next session rather than being
// gone forever after one click.
export function AnniversaryBanner() {
  const t = useTranslations("Anniversary");
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
  }, []);

  if (dismissed) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-6 py-2.5 text-center text-sm text-white"
      style={{ background: "var(--gradient-band)" }}
    >
      <p>
        <span className="font-bold text-[var(--color-gold)]">{t("bannerLabel")}</span>{" "}
        <span className="sm:hidden">{t("bannerTextShort")}</span>
        <span className="hidden sm:inline">{t("bannerText")}</span>{" "}
        <a
          href={anniversary.moreInfoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("bannerCta")}${t("opensInNewTab")}`}
          className="font-semibold text-[var(--color-gold)] underline underline-offset-2"
        >
          {t("bannerCta")}
        </a>
      </p>
      <button
        type="button"
        aria-label={t("dismissLabel")}
        onClick={() => {
          sessionStorage.setItem(DISMISSED_KEY, "1");
          setDismissed(true);
        }}
        className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={16} strokeWidth={2.25} aria-hidden="true" />
      </button>
    </div>
  );
}
