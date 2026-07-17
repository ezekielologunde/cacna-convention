"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { LeadershipMember } from "@/lib/content/leadership";
import type { CommitteeMember } from "@/lib/content/committee";
import type { history as History } from "@/lib/content/history";

type Tab = "story" | "leadership" | "committee";

export function AboutTabs({
  leadership,
  committee,
  history,
}: {
  leadership: LeadershipMember[];
  committee: CommitteeMember[];
  history: typeof History;
}) {
  const t = useTranslations("About");
  const [tab, setTab] = useState<Tab>("story");

  const tabs: { id: Tab; label: string }[] = [
    { id: "story", label: t("ourStory") },
    { id: "leadership", label: t("leadership") },
    { id: "committee", label: t("committee") },
  ];

  const tabClass = (active: boolean) =>
    `px-4 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? "border-b-2 border-[var(--color-maroon)] text-[var(--color-maroon)]"
        : "border-b-2 border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
    }`;

  return (
    <div className="mx-auto max-w-3xl px-6 pt-6 pb-12">
      <div role="tablist" className="flex gap-2 border-b border-[var(--color-border)]">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            role="tab"
            aria-selected={tab === tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={tabClass(tab === tabItem.id)}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "story" ? (
        <div className="mt-8 max-w-[68ch]">
          <p className="text-lg text-[var(--color-fg)]">
            {t("founded", {
              year: history.foundingYear,
              founder: history.founder,
              location: history.foundingLocation,
            })}
          </p>
          <p className="mt-4 text-[var(--color-muted)]">
            {t("todayReach", { count: history.zoneCount })}
          </p>
        </div>
      ) : null}

      {tab === "leadership" ? (
        <ul className="mt-8 flex flex-col gap-4">
          {leadership.map((member) => (
            <li key={member.name} className="rounded-2xl border border-[var(--color-border)] p-5">
              <p className="font-semibold text-[var(--color-fg)]">{member.name}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{member.title}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "committee" ? (
        <ul className="mt-8 flex flex-col gap-4">
          {committee.map((member) => (
            <li
              key={member.name}
              className="flex flex-col justify-between gap-1 rounded-2xl border border-[var(--color-border)] p-5 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold text-[var(--color-fg)]">{member.name}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {member.role} — {member.organization}
                </p>
              </div>
              <a
                href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
                className="text-sm font-semibold tabular-nums text-[var(--color-maroon)]"
              >
                {member.phone}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
