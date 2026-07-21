"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

export type RegistrantCategory = "adult" | "young_adult" | "child";

export type RegistrationPayload = {
  registrationType: "individual" | "group";
  churchName: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  registrants: { fullName: string; category: RegistrantCategory }[];
};

type RegistrantRow = { fullName: string; category: RegistrantCategory };

export function RegistrationForm({
  mode,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: {
  mode: "individual" | "group";
  onSubmit: (payload: RegistrationPayload) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}) {
  const t = useTranslations("Register");
  const [churchName, setChurchName] = useState("");
  const [registrants, setRegistrants] = useState<RegistrantRow[]>([
    { fullName: "", category: "adult" },
  ]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  // Announced via the aria-live region below -- adding/removing a row changes
  // the form's structure with no page navigation or visible dialog, so screen
  // reader users get no other signal that it happened.
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  function updateRegistrant(index: number, patch: Partial<RegistrantRow>) {
    setRegistrants((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addRegistrant() {
    setRegistrants((current) => [...current, { fullName: "", category: "adult" }]);
    setLiveAnnouncement(t("registrantAddedAnnouncement"));
  }

  function removeRegistrant(index: number) {
    setRegistrants((current) => current.filter((_, i) => i !== index));
    setLiveAnnouncement(t("registrantRemovedAnnouncement"));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      registrationType: mode,
      churchName: mode === "group" ? churchName : null,
      contactName,
      contactEmail,
      contactPhone,
      registrants,
    });
  }

  const inputClass =
    "rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-[var(--color-fg)] outline-none transition-colors focus:border-[var(--color-coral-text)] focus-visible:ring-2 focus-visible:ring-[var(--color-coral-text)] focus-visible:ring-offset-1";
  const labelClass = "flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
      <span aria-live="polite" className="sr-only">{liveAnnouncement}</span>
      {mode === "group" ? (
        <label className={labelClass}>
          {t("churchName")}
          <input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            required
            autoComplete="organization"
            className={inputClass}
          />
        </label>
      ) : null}

      {registrants.map((registrant, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] p-4 shadow-[var(--shadow-card)]"
        >
          <label className={labelClass}>
            {t("fullName")}
            <input
              value={registrant.fullName}
              onChange={(e) => updateRegistrant(index, { fullName: e.target.value })}
              required
              autoComplete="name"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            {t("category")}
            <select
              value={registrant.category}
              onChange={(e) =>
                updateRegistrant(index, { category: e.target.value as RegistrantCategory })
              }
              className={inputClass}
            >
              <option value="adult">{t("categoryAdult")}</option>
              <option value="young_adult">{t("categoryYoungAdult")}</option>
              <option value="child">{t("categoryChild")}</option>
            </select>
          </label>
          {mode === "group" && registrants.length > 1 ? (
            <button
              type="button"
              onClick={() => removeRegistrant(index)}
              className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-[var(--color-coral-text)] underline"
            >
              {t("removeRegistrant")}
            </button>
          ) : null}
        </div>
      ))}

      {mode === "group" ? (
        <button
          type="button"
          onClick={addRegistrant}
          className="inline-flex min-h-11 items-center self-start rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-coral-text)]"
        >
          {t("addRegistrant")}
        </button>
      ) : null}

      <label className={labelClass}>
        {t("contactName")}
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          required
          autoComplete="name"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        {t("contactEmail")}
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        {t("contactPhone")}
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          autoComplete="tel"
          className={inputClass}
        />
      </label>
      {errorMessage ? (
        <p role="alert" className="text-sm font-semibold text-[var(--color-coral-text)]">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full px-5 py-3 font-semibold text-white shadow-[var(--shadow-glow-coral)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100"
        style={{ background: "var(--gradient-cta)" }}
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
