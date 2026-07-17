import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>

      {!editions || editions.length === 0 ? (
        <p className="mt-4 text-[var(--color-muted)]">{t("empty")}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {editions.map((edition) => (
            <li key={edition.id} className="border-b border-[var(--color-border)] pb-6">
              <h2 className="text-xl font-medium">{edition.year} — {edition.theme}</h2>
              <p className="text-sm text-[var(--color-muted)]">
                {edition.starts_on} – {edition.ends_on}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
