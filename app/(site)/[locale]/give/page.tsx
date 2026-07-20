import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";

export default async function GivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Give");

  return (
    <>
      <PageHero title={t("title")} tone="teal" />
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <div className="rounded-3xl border border-[var(--color-border)] p-12 shadow-[var(--shadow-card)]">
          <span
            aria-hidden="true"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "var(--gradient-cta)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21l7.78-7.55 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          <p className="mx-auto mt-4 max-w-[42ch] text-[var(--color-muted)]">{t("intro")}</p>
          <a
            href="https://cacnorthamerica.com/giving"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("cta")}${t("opensInNewTab")}`}
            className="mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold text-white"
            style={{ background: "var(--gradient-cta)" }}
          >
            {t("cta")}
          </a>
        </div>
      </div>
    </>
  );
}
