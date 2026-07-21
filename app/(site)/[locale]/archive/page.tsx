import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/ui/PageHero";
import { RegisterCta } from "@/components/register/RegisterCta";
import { pageMetadata } from "@/lib/metadata";
import { recurringSpeakerNote } from "@/lib/content/archive";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Archive" });
  return pageMetadata({
    locale, path: "/archive", title: t("title"),
    description: "Past CACNA Annual Convention editions — themes, dates, and session counts.",
  });
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Archive");

  const supabase = await createClient();
  const { data: editions } = await supabase
    .from("convention_editions")
    .select("id, year, theme, starts_on, ends_on")
    .eq("status", "past")
    .order("year", { ascending: false });

  // Anchored at noon UTC (not `new Date(dateStr)` at midnight) so a
  // negative-offset timezone reading this at render time can't roll the
  // date back a day — same reasoning as ScheduleDay's weekday label.
  const dateFormatter = new Intl.DateTimeFormat(locale === "yo" ? "yo-NG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const formatDate = (dateStr: string) => dateFormatter.format(new Date(`${dateStr}T12:00:00Z`));

  return (
    <>
      <PageHero title={t("title")} tone="teal" />
      <div className="mx-auto w-full max-w-3xl px-6 py-12 2xl:max-w-4xl">
      <p className="text-sm text-[var(--color-muted)]">{recurringSpeakerNote}</p>
      {!editions || editions.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[var(--color-border)] p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-[var(--color-muted)]">{t("empty")}</p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {editions.map((edition) => (
            <li
              key={edition.id}
              className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
            >
              <h2 className="font-display text-xl text-[var(--color-fg)]">
                {edition.year} — {edition.theme}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)] tabular-nums">
                {formatDate(edition.starts_on)} – {formatDate(edition.ends_on)}
              </p>
            </li>
          ))}
        </ul>
      )}
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
