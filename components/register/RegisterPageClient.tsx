"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RegistrationForm, type RegistrationPayload } from "./RegistrationForm";

export function RegisterPageClient({ editionId }: { editionId: string }) {
  const t = useTranslations("Register");
  const [mode, setMode] = useState<"individual" | "group">("individual");

  function handleSubmit(payload: RegistrationPayload) {
    // Task 6 replaces this with a real POST to /api/register using editionId.
    console.log("submit", editionId, payload);
  }

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <div role="tablist" className="mt-6 flex gap-4 border-b border-[var(--color-border)]">
        <button
          role="tab"
          aria-selected={mode === "individual"}
          onClick={() => setMode("individual")}
          className="px-3 py-2"
        >
          {t("individualTab")}
        </button>
        <button
          role="tab"
          aria-selected={mode === "group"}
          onClick={() => setMode("group")}
          className="px-3 py-2"
        >
          {t("groupTab")}
        </button>
      </div>
      <div className="mt-6">
        <RegistrationForm mode={mode} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
