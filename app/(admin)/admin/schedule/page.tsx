import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { ScheduleAdminView } from "@/components/admin/ScheduleAdminView";

type Edition = { id: string; year: number; status: string; starts_on: string };

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ edition?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { edition: editionParam } = await searchParams;

  const { data: editionsData } = await supabase
    .from("convention_editions")
    .select("id, year, status, starts_on")
    .order("year", { ascending: false });
  const editions: Edition[] = editionsData ?? [];

  // Same "earliest current/upcoming year" default as /admin/registrations
  // -- placeholder future years (2028+) otherwise outrank the edition
  // people are actually building the schedule for right now.
  const activeCandidate = editions
    .filter((e) => e.status === "current" || e.status === "upcoming")
    .sort((a, b) => a.year - b.year)[0];
  const selected = editions.find((e) => e.id === editionParam) ?? activeCandidate ?? editions[0] ?? null;

  const { data: sessionsData } = selected
    ? await supabase
        .from("schedule_sessions")
        .select("id, day_date, starts_at, ends_at, title, minister_name, minister_title, track, audience, sort_order")
        .eq("edition_id", selected.id)
        .order("day_date", { ascending: true })
        .order("sort_order", { ascending: true })
    : { data: [] };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href="/admin" className="text-sm font-semibold text-[var(--color-red-text)] hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--color-fg)]">Schedule</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {editions.map((edition) => (
          <Link
            key={edition.id}
            href={`/admin/schedule?edition=${edition.id}`}
            className={
              selected?.id === edition.id
                ? "rounded-full bg-[var(--color-red-text)] px-4 py-2 text-sm font-bold text-white"
                : "rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:border-[var(--color-red-text)]"
            }
          >
            {edition.year}
          </Link>
        ))}
      </div>

      {!selected ? (
        <p className="mt-8 text-[var(--color-muted)]">No convention editions found.</p>
      ) : (
        <ScheduleAdminView
          key={selected.id}
          editionId={selected.id}
          editionStartsOn={selected.starts_on}
          otherEditions={editions.filter((e) => e.id !== selected.id)}
          initialSessions={sessionsData ?? []}
        />
      )}
    </div>
  );
}
