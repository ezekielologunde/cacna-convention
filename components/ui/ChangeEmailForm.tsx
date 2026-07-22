"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { createAttendeeClient } from "@/lib/supabase/client";

export function ChangeEmailForm({
  newEmailLabel,
  saveCta,
  savingCta,
  successMessage,
  errorMessage,
}: {
  newEmailLabel: string;
  saveCta: string;
  savingCta: string;
  successMessage: string;
  errorMessage: string;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setErrorText(null);

    const supabase = createAttendeeClient();
    // Supabase sends a confirmation link to the new address (and, with
    // "secure email change" enabled, also one to the current address) --
    // the account's actual email doesn't change until that's confirmed, so
    // this is deliberately not optimistic about the new address taking
    // effect immediately.
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }
    setNewEmail("");
    setStatus("saved");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex-1">
        <span className="sr-only">{newEmailLabel}</span>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder={newEmailLabel}
          value={newEmail}
          onChange={(event) => {
            setNewEmail(event.target.value);
            setStatus("idle");
          }}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
        />
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" disabled={status === "saving"}>
          {status === "saving" ? savingCta : saveCta}
        </Button>
      </div>
      {status === "saved" && (
        <span role="status" className="text-sm font-semibold text-[var(--color-blue-text)]">
          {successMessage}
        </span>
      )}
      {status === "error" && (
        <span role="alert" className="text-sm font-semibold text-[var(--color-red-text)]">
          {errorText ?? errorMessage}
        </span>
      )}
    </form>
  );
}
