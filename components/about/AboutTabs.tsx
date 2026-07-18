"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { BulletList } from "@/components/ui/BulletList";
import { externalResources } from "@/lib/content/external-resources";
import type { LeadershipMember } from "@/lib/content/leadership";
import type { CommitteeMember } from "@/lib/content/committee";
import type { Superintendent } from "@/lib/content/superintendents";
import type { AboutConvention } from "@/lib/content/about-convention";
import type { history as History } from "@/lib/content/history";

type Tab = "story" | "leadership" | "committee" | "superintendents";

export function AboutTabs({
  leadership,
  committee,
  superintendents,
  aboutConvention,
  history,
}: {
  leadership: LeadershipMember[];
  committee: CommitteeMember[];
  superintendents: Superintendent[];
  aboutConvention: AboutConvention;
  history: typeof History;
}) {
  const t = useTranslations("About");
  const [tab, setTab] = useState<Tab>("story");

  const tabs: { id: Tab; label: string }[] = [
    { id: "story", label: t("ourStory") },
    { id: "leadership", label: t("leadership") },
    { id: "committee", label: t("committee") },
    { id: "superintendents", label: t("superintendents") },
  ];

  const tabClass = (active: boolean) =>
    `inline-flex min-h-11 flex-none items-center whitespace-nowrap px-4 text-sm font-semibold transition-colors ${
      active
        ? "border-b-2 border-[var(--color-maroon)] text-[var(--color-maroon)]"
        : "border-b-2 border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
    }`;

  return (
    <div className="mx-auto max-w-3xl pt-6 pb-12">
      <div
        role="tablist"
        className="flex gap-2 overflow-x-auto border-b border-[var(--color-border)] px-6"
      >
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            id={`about-tab-${tabItem.id}`}
            role="tab"
            aria-selected={tab === tabItem.id}
            aria-controls={`about-panel-${tabItem.id}`}
            onClick={() => setTab(tabItem.id)}
            className={tabClass(tab === tabItem.id)}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "story" ? (
        <div
          id="about-panel-story"
          role="tabpanel"
          aria-labelledby="about-tab-story"
          className="mt-8 max-w-[68ch] px-6"
        >
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
          <p className="mt-4 text-[var(--color-muted)]">{history.fitaHqNote}</p>
          <p className="mt-4 text-[var(--color-muted)]">{history.governanceNote}</p>

          <h3 className="mt-6 font-display text-lg text-[var(--color-fg)]">
            {t("missionHeading")}
          </h3>
          <p className="mt-2 text-[var(--color-muted)]">{aboutConvention.missionStatement}</p>

          <h3 className="mt-6 text-sm font-bold tracking-wide text-[var(--color-maroon)] uppercase">
            {t("biblicallyBasedHeading")}
          </h3>
          <BulletList
            items={aboutConvention.biblicallyBased}
            className="gap-1.5 text-[var(--color-muted)]"
          />

          <h3 className="mt-6 text-sm font-bold tracking-wide text-[var(--color-maroon)] uppercase">
            {t("kingdomFocusedHeading")}
          </h3>
          <BulletList
            items={aboutConvention.kingdomFocused}
            className="gap-1.5 text-[var(--color-muted)]"
          />

          <h3 className="mt-6 text-sm font-bold tracking-wide text-[var(--color-maroon)] uppercase">
            {t("externalResourcesHeading")}
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {externalResources.map((resource) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${resource.label}${t("opensInNewTab")}`}
                  className="font-semibold text-[var(--color-maroon)] underline"
                >
                  {resource.label}
                </a>
                <span className="text-[var(--color-muted)]"> — {resource.description}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "leadership" ? (
        <ul
          id="about-panel-leadership"
          role="tabpanel"
          aria-labelledby="about-tab-leadership"
          className="mt-8 flex flex-col gap-4 px-6"
        >
          {leadership.map((member) => (
            <li
              key={member.name}
              className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
            >
              <Image
                src={member.photo}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 flex-none rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-[var(--color-fg)]">{member.name}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{member.title}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "committee" ? (
        <ul
          id="about-panel-committee"
          role="tabpanel"
          aria-labelledby="about-tab-committee"
          className="mt-8 flex flex-col gap-4 px-6"
        >
          {committee.map((member) => (
            <li
              key={member.name}
              className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
            >
              <p className="font-semibold text-[var(--color-fg)]">{member.name}</p>
              {member.role ? (
                <p className="mt-1 text-sm text-[var(--color-muted)]">{member.role}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "superintendents" ? (
        <ul
          id="about-panel-superintendents"
          role="tabpanel"
          aria-labelledby="about-tab-superintendents"
          className="mt-8 flex flex-col gap-4 px-6"
        >
          {superintendents.map((person) => (
            <li
              key={person.name}
              className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
            >
              <p className="font-semibold text-[var(--color-fg)]">{person.name}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{person.title}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
