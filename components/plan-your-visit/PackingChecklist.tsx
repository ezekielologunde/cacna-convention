"use client";

import { useEffect, useState } from "react";
import type { PackingItem } from "@/lib/content/travel";

const STORAGE_KEY = "cacna-packing-checklist";

export function PackingChecklist({
  items,
  resetCta,
}: {
  items: PackingItem[];
  resetCta: string;
}) {
  // Starts empty (matching the server-rendered markup) and hydrates from
  // localStorage in an effect -- reading localStorage during the initial
  // render would mismatch what the server sent and React would warn about
  // a hydration error.
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setChecked(JSON.parse(saved));
      } catch {
        // Corrupted/foreign value under this key -- ignore and start fresh
        // rather than throwing.
      }
    }
  }, []);

  function toggle(label: string) {
    setChecked((current) => {
      const next = { ...current, [label]: !current[label] };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function reset() {
    setChecked({});
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const checkedCount = items.filter((item) => checked[item.label]).length;

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-2.5">
              <input
                type="checkbox"
                checked={Boolean(checked[item.label])}
                onChange={() => toggle(item.label)}
                className="h-4 w-4 flex-none accent-[var(--color-red-text)]"
              />
              <span
                className={
                  checked[item.label]
                    ? "text-sm text-[var(--color-muted)] line-through"
                    : "text-sm text-[var(--color-fg)]"
                }
              >
                {item.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {checkedCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="mt-3 text-sm font-semibold text-[var(--color-red-text)] hover:underline"
        >
          {resetCta}
        </button>
      )}
    </div>
  );
}
