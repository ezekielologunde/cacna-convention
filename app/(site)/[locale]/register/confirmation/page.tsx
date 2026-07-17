import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function RegisterConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("RegisterConfirmation");

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full text-white"
        style={{ background: "var(--flame)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-[48ch] text-[var(--color-muted)]">{t("body")}</p>
    </div>
  );
}
