import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getScheduleForEdition } from "@/lib/schedule";
import { ScheduleDay } from "@/components/schedule/ScheduleDay";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Schedule");

  const supabase = await createClient();
  const { data: edition } = await supabase
    .from("convention_editions")
    .select("id")
    .in("status", ["current", "upcoming"])
    .order("year", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!edition) {
    return (
      <div className="px-6 py-12">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{t("noEdition")}</p>
      </div>
    );
  }

  const sessions = await getScheduleForEdition(supabase, edition.id);
  const byDay = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const existing = byDay.get(session.day_date) ?? [];
    existing.push(session);
    byDay.set(session.day_date, existing);
  }

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      {Array.from(byDay.entries()).map(([dayDate, daySessions]) => (
        <ScheduleDay key={dayDate} dayDate={dayDate} sessions={daySessions} />
      ))}
    </div>
  );
}
