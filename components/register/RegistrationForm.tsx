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

export function RegistrationForm({
  mode,
  onSubmit,
}: {
  mode: "individual" | "group";
  onSubmit: (payload: RegistrationPayload) => void;
}) {
  const t = useTranslations("Register");
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState<RegistrantCategory>("adult");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      registrationType: mode,
      churchName: null,
      contactName,
      contactEmail,
      contactPhone,
      registrants: [{ fullName, category }],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1">
        {t("fullName")}
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        {t("category")}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as RegistrantCategory)}
          className="rounded border border-[var(--color-border)] px-3 py-2"
        >
          <option value="adult">{t("categoryAdult")}</option>
          <option value="young_adult">{t("categoryYoungAdult")}</option>
          <option value="child">{t("categoryChild")}</option>
        </select>
      </label>
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
