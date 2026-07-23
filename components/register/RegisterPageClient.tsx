"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { RegistrationForm, type RegistrationPayload } from "./RegistrationForm";

const TAB_ORDER = ["individual", "group", "complimentary"] as const;
type Mode = (typeof TAB_ORDER)[number];

export function RegisterPageClient() {
  const t = useTranslations("Register");
  const [mode, setMode] = useState<Mode>("individual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const individualTabRef = useRef<HTMLButtonElement>(null);
  const groupTabRef = useRef<HTMLButtonElement>(null);
  const complimentaryTabRef = useRef<HTMLButtonElement>(null);
  const tabRefs = {
    individual: individualTabRef,
    group: groupTabRef,
    complimentary: complimentaryTabRef,
  } as const;

  // WAI-ARIA APG Tabs pattern: Left/Right moves focus AND selection between
  // tabs (roving tabindex below keeps only the active tab in the Tab order).
  // Wraps around a 3-item order rather than a plain toggle, now that there
  // are three tabs instead of two.
  function onTabsKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const currentIndex = TAB_ORDER.indexOf(mode);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = TAB_ORDER[(currentIndex + delta + TAB_ORDER.length) % TAB_ORDER.length];
    setMode(next);
    tabRefs[next].current?.focus();
  }

  async function handleSubmit(payload: RegistrationPayload) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Surface the server's specific validation/pricing message (e.g. "No
        // active price for category child") when present, rather than
        // always falling back to a generic string that can't tell the user
        // what to actually fix.
        const body = await response.json().catch(() => null);
        setErrorMessage(typeof body?.error === "string" ? body.error : t("submitError"));
        setIsSubmitting(false);
        return;
      }

      const { checkoutUrl } = await response.json();
      // Leave isSubmitting true (keeps the button disabled) through the
      // redirect below — there's no "success" state to reset to on this page.
      window.location.href = checkoutUrl;
    } catch {
      setErrorMessage(t("submitError"));
      setIsSubmitting(false);
    }
  }

  const tabClass = (active: boolean) =>
    `inline-flex min-h-11 items-center px-4 text-sm font-semibold transition-colors ${
      active
        ? "border-b-2 border-[var(--color-red-text)] text-[var(--color-red-text)]"
        : "border-b-2 border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
    }`;

  return (
    <div className="mx-auto w-full max-w-[clamp(20rem,90vw,60rem)] px-6 py-12">
      <div role="tablist" className="flex gap-2 border-b border-[var(--color-border)]" onKeyDown={onTabsKeyDown}>
        <button
          ref={individualTabRef}
          id="register-tab-individual"
          role="tab"
          aria-selected={mode === "individual"}
          aria-controls="register-panel"
          tabIndex={mode === "individual" ? 0 : -1}
          onClick={() => setMode("individual")}
          className={tabClass(mode === "individual")}
        >
          {t("individualTab")}
        </button>
        <button
          ref={groupTabRef}
          id="register-tab-group"
          role="tab"
          aria-selected={mode === "group"}
          aria-controls="register-panel"
          tabIndex={mode === "group" ? 0 : -1}
          onClick={() => setMode("group")}
          className={tabClass(mode === "group")}
        >
          {t("groupTab")}
        </button>
        <button
          ref={complimentaryTabRef}
          id="register-tab-complimentary"
          role="tab"
          aria-selected={mode === "complimentary"}
          aria-controls="register-panel"
          tabIndex={mode === "complimentary" ? 0 : -1}
          onClick={() => setMode("complimentary")}
          className={tabClass(mode === "complimentary")}
        >
          {t("complimentaryTab")}
        </button>
      </div>
      <div
        id="register-panel"
        role="tabpanel"
        aria-labelledby={`register-tab-${mode}`}
        className="mt-8"
      >
        <RegistrationForm
          // The Complimentary tab reuses the single-registrant Individual
          // layout (no church name, no add-another-registrant) -- it's a
          // one-off comp/staff-test registration, not a group booking.
          mode={mode === "complimentary" ? "individual" : mode}
          isComplimentary={mode === "complimentary"}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
