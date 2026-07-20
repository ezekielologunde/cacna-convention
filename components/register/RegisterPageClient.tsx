"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RegistrationForm, type RegistrationPayload } from "./RegistrationForm";

export function RegisterPageClient() {
  const t = useTranslations("Register");
  const [mode, setMode] = useState<"individual" | "group">("individual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        setErrorMessage(t("submitError"));
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
        ? "border-b-2 border-[var(--color-coral-text)] text-[var(--color-coral-text)]"
        : "border-b-2 border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
    }`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <div role="tablist" className="mt-6 flex gap-2 border-b border-[var(--color-border)]">
        <button
          id="register-tab-individual"
          role="tab"
          aria-selected={mode === "individual"}
          aria-controls="register-panel"
          onClick={() => setMode("individual")}
          className={tabClass(mode === "individual")}
        >
          {t("individualTab")}
        </button>
        <button
          id="register-tab-group"
          role="tab"
          aria-selected={mode === "group"}
          aria-controls="register-panel"
          onClick={() => setMode("group")}
          className={tabClass(mode === "group")}
        >
          {t("groupTab")}
        </button>
      </div>
      <div
        id="register-panel"
        role="tabpanel"
        aria-labelledby={mode === "individual" ? "register-tab-individual" : "register-tab-group"}
        className="mt-8"
      >
        <RegistrationForm
          mode={mode}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
