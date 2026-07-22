"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScheduleDay, type Audience } from "@/components/schedule/ScheduleDay";

type SessionSummary = {
  id: string;
  starts_at: string;
  ends_at: string;
  title: string;
  minister_name: string | null;
  minister_title: string | null;
  audience: Audience[];
};

const FILTERS: Audience[] = ["all", "youth", "adult", "children"];

export function ScheduleView({
  days,
}: {
  days: { dayDate: string; sessions: SessionSummary[] }[];
}) {
  const t = useTranslations("Schedule");
  const [filter, setFilter] = useState<Audience>("all");
  const filterLabels: Record<Audience, string> = {
    all: t("filterAll"),
    youth: t("filterYouth"),
    adult: t("filterAdult"),
    children: t("filterChildren"),
  };

  // "All" filter shows every session regardless of tag -- every other
  // filter shows a session if it's tagged for that specific age group OR
  // it's a general (audience=['all']) session everyone attends.
  const visibleDays = days.map(({ dayDate, sessions }) => ({
    dayDate,
    sessions:
      filter === "all"
        ? sessions
        : sessions.filter(
            (session) => session.audience.includes("all") || session.audience.includes(filter)
          ),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div
        role="group"
        aria-label={t("filterGroupLabel")}
        className="flex flex-wrap gap-2 rounded-full border border-[var(--color-border)] p-1.5 sm:self-start"
      >
        {FILTERS.map((audience) => {
          const isActive = filter === audience;
          return (
            <button
              key={audience}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilter(audience)}
              className={
                isActive
                  ? "rounded-full px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
              }
              style={isActive ? { background: "var(--gradient-cta)" } : undefined}
            >
              {filterLabels[audience]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        {visibleDays.map(({ dayDate, sessions }) => (
          <ScheduleDay key={dayDate} dayDate={dayDate} sessions={sessions} />
        ))}
      </div>
    </div>
  );
}
