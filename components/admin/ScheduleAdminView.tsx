"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Audience = "youth" | "adult" | "children";
const AUDIENCE_OPTIONS: Audience[] = ["youth", "adult", "children"];
const TRACK_OPTIONS = ["general", "ministers", "breakout"];

type SessionRow = {
  id: string;
  day_date: string;
  starts_at: string;
  ends_at: string;
  title: string;
  minister_name: string | null;
  minister_title: string | null;
  track: string;
  audience: string[];
  sort_order: number;
};

type EditionOption = { id: string; year: number; starts_on: string };

type Draft = {
  day_date: string;
  starts_at: string;
  ends_at: string;
  title: string;
  minister_name: string;
  minister_title: string;
  track: string;
  audience: Audience[];
  sort_order: number;
};

function toDraft(session: SessionRow): Draft {
  return {
    day_date: session.day_date,
    starts_at: session.starts_at.slice(0, 5),
    ends_at: session.ends_at.slice(0, 5),
    title: session.title,
    minister_name: session.minister_name ?? "",
    minister_title: session.minister_title ?? "",
    track: session.track,
    audience: session.audience.filter((a): a is Audience => a !== "all") as Audience[],
    sort_order: session.sort_order,
  };
}

const EMPTY_DRAFT: Draft = {
  day_date: "",
  starts_at: "",
  ends_at: "",
  title: "",
  minister_name: "",
  minister_title: "",
  track: "general",
  audience: [],
  sort_order: 0,
};

// Shifts every source day_date by the same day-of-convention offset it had
// relative to the source edition's own start date -- "day 2 of the
// convention" should land on the target's actual day 2, not a copy-pasted
// calendar date from a different year.
function shiftDate(sourceStartsOn: string, sourceDate: string, targetStartsOn: string): string {
  const offsetMs = new Date(`${sourceDate}T00:00:00Z`).getTime() - new Date(`${sourceStartsOn}T00:00:00Z`).getTime();
  const shifted = new Date(new Date(`${targetStartsOn}T00:00:00Z`).getTime() + offsetMs);
  return shifted.toISOString().slice(0, 10);
}

function DraftForm({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (next: Draft) => void;
}) {
  function toggleAudience(a: Audience) {
    onChange({
      ...draft,
      audience: draft.audience.includes(a) ? draft.audience.filter((x) => x !== a) : [...draft.audience, a],
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-muted)]">
        Date
        <input
          type="date"
          value={draft.day_date}
          onChange={(e) => onChange({ ...draft, day_date: e.target.value })}
          className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-fg)]"
        />
      </label>
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-[var(--color-muted)]">
          Starts
          <input
            type="time"
            value={draft.starts_at}
            onChange={(e) => onChange({ ...draft, starts_at: e.target.value })}
            className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-fg)]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-[var(--color-muted)]">
          Ends
          <input
            type="time"
            value={draft.ends_at}
            onChange={(e) => onChange({ ...draft, ends_at: e.target.value })}
            className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-fg)]"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-muted)] sm:col-span-2">
        Title
        <input
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-fg)]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-muted)]">
        Minister name
        <input
          value={draft.minister_name}
          onChange={(e) => onChange({ ...draft, minister_name: e.target.value })}
          className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-fg)]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-muted)]">
        Minister title
        <input
          value={draft.minister_title}
          onChange={(e) => onChange({ ...draft, minister_title: e.target.value })}
          className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-fg)]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-muted)]">
        Track
        <select
          value={draft.track}
          onChange={(e) => onChange({ ...draft, track: e.target.value })}
          className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-fg)]"
        >
          {TRACK_OPTIONS.map((track) => (
            <option key={track} value={track}>
              {track}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-muted)]">
        Order
        <input
          type="number"
          value={draft.sort_order}
          onChange={(e) => onChange({ ...draft, sort_order: Number(e.target.value) || 0 })}
          className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-fg)]"
        />
      </label>
      <fieldset className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-muted)] sm:col-span-2">
        <legend>Audience (leave all unchecked for "everyone")</legend>
        <div className="mt-1 flex gap-4">
          {AUDIENCE_OPTIONS.map((a) => (
            <label key={a} className="flex items-center gap-1.5 font-normal text-[var(--color-fg)] normal-case">
              <input
                type="checkbox"
                checked={draft.audience.includes(a)}
                onChange={() => toggleAudience(a)}
              />
              {a}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function draftToPayload(draft: Draft, editionId: string) {
  return {
    edition_id: editionId,
    day_date: draft.day_date,
    starts_at: draft.starts_at.length === 5 ? `${draft.starts_at}:00` : draft.starts_at,
    ends_at: draft.ends_at.length === 5 ? `${draft.ends_at}:00` : draft.ends_at,
    title: draft.title.trim(),
    minister_name: draft.minister_name.trim() || null,
    minister_title: draft.minister_title.trim() || null,
    track: draft.track,
    audience: draft.audience.length > 0 ? draft.audience : ["all"],
    sort_order: draft.sort_order,
  };
}

export function ScheduleAdminView({
  editionId,
  editionStartsOn,
  otherEditions,
  initialSessions,
}: {
  editionId: string;
  editionStartsOn: string;
  otherEditions: EditionOption[];
  initialSessions: SessionRow[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY_DRAFT);
  const [cloneSourceId, setCloneSourceId] = useState(otherEditions[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  const byDay = new Map<string, SessionRow[]>();
  for (const session of initialSessions) {
    const existing = byDay.get(session.day_date) ?? [];
    existing.push(session);
    byDay.set(session.day_date, existing);
  }
  const orderedDays = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b));

  function startEdit(session: SessionRow) {
    setEditingId(session.id);
    setEditDraft(toDraft(session));
    setStatus("idle");
    setErrorText(null);
  }

  async function saveEdit(id: string) {
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("schedule_sessions")
      .update(draftToPayload(editDraft, editionId))
      .eq("id", id);

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }
    setEditingId(null);
    setStatus("idle");
    router.refresh();
  }

  async function deleteSession(id: string) {
    if (!window.confirm("Delete this session?")) return;
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.from("schedule_sessions").delete().eq("id", id);

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }
    setStatus("idle");
    router.refresh();
  }

  async function addSession() {
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.from("schedule_sessions").insert(draftToPayload(newDraft, editionId));

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }
    setNewDraft(EMPTY_DRAFT);
    setStatus("idle");
    router.refresh();
  }

  async function cloneFromSource() {
    if (!cloneSourceId) return;
    setStatus("saving");
    setErrorText(null);
    const supabase = createClient();

    const source = otherEditions.find((e) => e.id === cloneSourceId);
    if (!source) {
      setStatus("error");
      setErrorText("Source edition not found.");
      return;
    }

    const { data: sourceSessions, error: fetchError } = await supabase
      .from("schedule_sessions")
      .select("day_date, starts_at, ends_at, title, minister_name, minister_title, track, audience, sort_order")
      .eq("edition_id", cloneSourceId);

    if (fetchError) {
      setStatus("error");
      setErrorText(fetchError.message);
      return;
    }
    if (!sourceSessions || sourceSessions.length === 0) {
      setStatus("error");
      setErrorText(`${source.year} has no schedule to clone.`);
      return;
    }

    const rows = sourceSessions.map((s) => ({
      edition_id: editionId,
      day_date: shiftDate(source.starts_on, s.day_date, editionStartsOn),
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      title: s.title,
      minister_name: s.minister_name,
      minister_title: s.minister_title,
      track: s.track,
      audience: s.audience,
      sort_order: s.sort_order,
    }));

    const { error: insertError } = await supabase.from("schedule_sessions").insert(rows);
    if (insertError) {
      setStatus("error");
      setErrorText(insertError.message);
      return;
    }
    setStatus("idle");
    router.refresh();
  }

  if (initialSessions.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-fg)]">No schedule yet for this edition</h2>
        {otherEditions.length > 0 ? (
          <>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Clone the day-by-day schedule from a previous edition, then edit just what changed --
              conventions repeat most of the same rhythm year to year.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={cloneSourceId}
                onChange={(e) => setCloneSourceId(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-fg)]"
              >
                {otherEditions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.year}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={cloneFromSource}
                disabled={status === "saving"}
                className="rounded-full bg-[var(--color-red-text)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {status === "saving" ? "Cloning…" : "Clone schedule"}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-[var(--color-muted)]">No other edition has a schedule to clone from yet.</p>
        )}
        {status === "error" && <p className="mt-3 text-sm font-semibold text-red-600">{errorText}</p>}
      </div>
    );
  }

  return (
    <div className="mt-8">
      {status === "error" && (
        <p className="mb-4 text-sm font-semibold text-red-600" role="alert">
          {errorText}
        </p>
      )}
      <div className="flex flex-col gap-6">
        {orderedDays.map(([dayDate, sessions]) => (
          <section key={dayDate} className="rounded-2xl border border-[var(--color-border)] p-5">
            <h2 className="font-semibold text-[var(--color-fg)]">{dayDate}</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {sessions.map((session) => (
                <li key={session.id} className="rounded-xl border border-[var(--color-border)] p-4">
                  {editingId === session.id ? (
                    <div>
                      <DraftForm draft={editDraft} onChange={setEditDraft} />
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(session.id)}
                          disabled={status === "saving"}
                          className="rounded-full bg-[var(--color-red-text)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                        >
                          {status === "saving" ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-red-text)] tabular-nums">
                          {session.starts_at.slice(0, 5)}–{session.ends_at.slice(0, 5)}
                        </p>
                        <p className="mt-0.5 font-semibold text-[var(--color-fg)]">{session.title}</p>
                        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                          {session.minister_name ?? "—"}
                          {session.minister_title ? ` — ${session.minister_title}` : ""} · {session.track} ·{" "}
                          {session.audience.join(", ")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(session)}
                          className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-fg)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSession(session.id)}
                          className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--color-border)] p-5">
        <h2 className="font-semibold text-[var(--color-fg)]">Add a session</h2>
        <div className="mt-3">
          <DraftForm draft={newDraft} onChange={setNewDraft} />
        </div>
        <button
          type="button"
          onClick={addSession}
          disabled={status === "saving" || !newDraft.day_date || !newDraft.title}
          className="mt-3 rounded-full bg-[var(--color-red-text)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {status === "saving" ? "Adding…" : "Add session"}
        </button>
      </section>
    </div>
  );
}
