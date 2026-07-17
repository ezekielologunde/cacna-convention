"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RegistrationForm, type RegistrationPayload } from "./RegistrationForm";

export function RegisterPageClient() {
  const t = useTranslations("Register");
  const [mode, setMode] = useState<"individual" | "group">("individual");

  async function handleSubmit(payload: RegistrationPayload) {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // A real error-message UI is a reasonable future enhancement; for now,
      // surface the failure clearly rather than silently doing nothing.
      alert("Registration failed. Please try again or contact us.");
      return;
    }

    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? "border-b-2 border-[var(--color-maroon)] text-[var(--color-maroon)]"
        : "border-b-2 border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
    }`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <div role="tablist" className="mt-6 flex gap-2 border-b border-[var(--color-border)]">
        <button
          role="tab"
          aria-selected={mode === "individual"}
          onClick={() => setMode("individual")}
          className={tabClass(mode === "individual")}
        >
          {t("individualTab")}
        </button>
        <button
          role="tab"
          aria-selected={mode === "group"}
          onClick={() => setMode("group")}
          className={tabClass(mode === "group")}
        >
          {t("groupTab")}
        </button>
      </div>
      <div className="mt-8">
        <RegistrationForm mode={mode} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
