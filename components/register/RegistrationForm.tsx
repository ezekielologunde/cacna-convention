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
}: {
  mode: "individual" | "group";
  onSubmit: (payload: RegistrationPayload) => void;
}) {
  const t = useTranslations("Register");
  const [churchName, setChurchName] = useState("");
  const [registrants, setRegistrants] = useState<RegistrantRow[]>([
    { fullName: "", category: "adult" },
  ]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  function updateRegistrant(index: number, patch: Partial<RegistrantRow>) {
    setRegistrants((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addRegistrant() {
    setRegistrants((current) => [...current, { fullName: "", category: "adult" }]);
  }

  function removeRegistrant(index: number) {
    setRegistrants((current) => current.filter((_, i) => i !== index));
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

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      {mode === "group" ? (
        <label className="flex flex-col gap-1">
          {t("churchName")}
          <input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            required
            className="rounded border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      ) : null}

      {registrants.map((registrant, index) => (
        <div key={index} className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4">
          <label className="flex flex-col gap-1">
            {t("fullName")}
            <input
              value={registrant.fullName}
              onChange={(e) => updateRegistrant(index, { fullName: e.target.value })}
              required
              className="rounded border border-[var(--color-border)] px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            {t("category")}
            <select
              value={registrant.category}
              onChange={(e) =>
                updateRegistrant(index, { category: e.target.value as RegistrantCategory })
              }
              className="rounded border border-[var(--color-border)] px-3 py-2"
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
              className="self-start text-sm text-[var(--color-muted)] underline"
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
          className="self-start rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
        >
          {t("addRegistrant")}
        </button>
      ) : null}

      <label className="flex flex-col gap-1">
        {t("contactName")}
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("contactEmail")}
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("contactPhone")}
        <input
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-[var(--color-brand)] px-5 py-2 font-medium text-[var(--color-brand-contrast)]"
      >
        {t("submit")}
      </button>
    </form>
  );
}
