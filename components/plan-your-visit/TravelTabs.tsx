"use client";

import { useRef, useState } from "react";
import type { Airport } from "@/lib/content/travel";

const tabClass = (active: boolean) =>
  `inline-flex min-h-11 items-center px-4 text-sm font-semibold transition-colors ${
    active
      ? "border-b-2 border-[var(--color-red-text)] text-[var(--color-red-text)]"
      : "border-b-2 border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
  }`;

export function TravelTabs({
  flyingLabel,
  drivingLabel,
  venueHeading,
  venueAddress,
  recommendedAirportLabel,
  recommendedAirport,
  recommendedAirportMilesLabel,
  otherAirportsHeading,
  nearbyAirports,
  groundTransportNote,
  drivingHeading,
  drivingRoute,
  drivingRouteAlt,
}: {
  flyingLabel: string;
  drivingLabel: string;
  venueHeading: string;
  venueAddress: string;
  recommendedAirportLabel: string;
  recommendedAirport: Airport;
  // A plain pre-formatted string, not a `(miles) => string` function --
  // functions can't cross the Server-to-Client Component boundary
  // (confirmed live: "Functions cannot be passed directly to Client
  // Components" the moment this page actually rendered through Next.js,
  // even though rendering this component directly in a unit test never
  // exercises that boundary and didn't catch it).
  recommendedAirportMilesLabel: string;
  otherAirportsHeading: string;
  nearbyAirports: Airport[];
  groundTransportNote: string;
  drivingHeading: string;
  drivingRoute: string;
  drivingRouteAlt: string;
}) {
  const [mode, setMode] = useState<"flying" | "driving">("flying");
  const flyingTabRef = useRef<HTMLButtonElement>(null);
  const drivingTabRef = useRef<HTMLButtonElement>(null);

  // WAI-ARIA APG Tabs pattern: Left/Right moves focus AND selection between
  // tabs (roving tabindex below keeps only the active tab in the Tab
  // order) -- same pattern already established in RegisterPageClient.
  function onTabsKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = mode === "flying" ? "driving" : "flying";
    setMode(next);
    (next === "flying" ? flyingTabRef : drivingTabRef).current?.focus();
  }

  return (
    <div>
      <p className="text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-fg)]">{venueHeading}: </span>
        {venueAddress}
      </p>
      <div
        role="tablist"
        className="mt-4 flex gap-2 border-b border-[var(--color-border)]"
        onKeyDown={onTabsKeyDown}
      >
        <button
          ref={flyingTabRef}
          id="travel-tab-flying"
          role="tab"
          aria-selected={mode === "flying"}
          aria-controls="travel-panel"
          tabIndex={mode === "flying" ? 0 : -1}
          onClick={() => setMode("flying")}
          className={tabClass(mode === "flying")}
        >
          {flyingLabel}
        </button>
        <button
          ref={drivingTabRef}
          id="travel-tab-driving"
          role="tab"
          aria-selected={mode === "driving"}
          aria-controls="travel-panel"
          tabIndex={mode === "driving" ? 0 : -1}
          onClick={() => setMode("driving")}
          className={tabClass(mode === "driving")}
        >
          {drivingLabel}
        </button>
      </div>
      <div
        id="travel-panel"
        role="tabpanel"
        aria-labelledby={mode === "flying" ? "travel-tab-flying" : "travel-tab-driving"}
        className="mt-5"
      >
        {mode === "flying" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-bold tracking-wide text-[var(--color-red-text)] uppercase">
                  {recommendedAirportLabel}
                </p>
                <p className="mt-1.5 font-semibold text-[var(--color-fg)]">{recommendedAirport.name}</p>
                <p className="mt-0.5 text-sm text-[var(--color-muted)] tabular-nums">
                  {recommendedAirportMilesLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
                  {otherAirportsHeading}
                </p>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-fg)]">
                  {nearbyAirports.map((airport) => (
                    <li key={airport.name} className="flex justify-between gap-3">
                      <span>{airport.name}</span>
                      <span className="text-[var(--color-muted)] tabular-nums">{airport.distanceMiles} mi</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--color-muted)]">{groundTransportNote}</p>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--color-muted)]">
              <span className="font-semibold text-[var(--color-fg)]">{drivingHeading}: </span>
              {drivingRoute}
            </p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">{drivingRouteAlt}</p>
          </>
        )}
      </div>
    </div>
  );
}
