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

  return (
    <div className="px-6 py-12">
      <div role="tablist" className="flex gap-4 border-b border-[var(--color-border)]">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            role="tab"
            aria-selected={tab === tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className="px-3 py-2"
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "story" ? (
        <p className="mt-6 max-w-2xl">
          {t("founded", {
            year: history.foundingYear,
            founder: history.founder,
            location: history.foundingLocation,
          })}
        </p>
      ) : null}

      {tab === "leadership" ? (
        <ul className="mt-6 flex flex-col gap-4">
          {leadership.map((member) => (
            <li key={member.name}>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-[var(--color-muted)]">{member.title}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "committee" ? (
        <ul className="mt-6 flex flex-col gap-4">
          {committee.map((member) => (
            <li key={member.name}>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {member.role} — {member.organization}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
