import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-4 max-w-md text-lg text-[var(--color-muted)]">{t("subtitle")}</p>
      <div className="mt-8 flex gap-4">
        <Link
          href={`/${locale}/about`}
          className="rounded-full border border-[var(--color-border)] px-5 py-2 font-medium"
        >
          {t("learnMore")}
        </Link>
        <Link
          href={`/${locale}/schedule`}
          className="rounded-full border border-[var(--color-border)] px-5 py-2 font-medium"
        >
          {t("viewSchedule")}
        </Link>
      </div>
    </div>
  );
}
