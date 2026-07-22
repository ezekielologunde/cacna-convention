"use client";

import { useState } from "react";
import type { EssentialCategory, NearbyEssential } from "@/lib/content/nearby-essentials";

const FILTERS: (EssentialCategory | "all")[] = ["all", "food", "groceriesPharmacy", "gas"];

export function NearbyEssentials({
  items,
  groupLabel,
  filterLabels,
}: {
  items: NearbyEssential[];
  groupLabel: string;
  filterLabels: Record<EssentialCategory | "all", string>;
}) {
  const [filter, setFilter] = useState<EssentialCategory | "all">("all");
  const visible = filter === "all" ? items : items.filter((item) => item.category === filter);

  const byArea = new Map<string, NearbyEssential[]>();
  for (const item of visible) {
    const existing = byArea.get(item.area) ?? [];
    existing.push(item);
    byArea.set(item.area, existing);
  }

  return (
    <div>
      <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
        {FILTERS.map((key) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(key)}
              className={
                active
                  ? "rounded-full px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              }
              style={active ? { background: "var(--gradient-cta)" } : undefined}
            >
              {filterLabels[key]}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {Array.from(byArea.entries()).map(([area, areaItems]) => (
          <div key={area}>
            <h3 className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">{area}</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {areaItems.map((item) => (
                <li
                  key={`${item.name}-${item.address}`}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-[var(--color-border)] px-4 py-3"
                >
                  <span className="font-semibold text-[var(--color-fg)]">{item.name}</span>
                  <span className="text-sm text-[var(--color-muted)]">{item.address}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
