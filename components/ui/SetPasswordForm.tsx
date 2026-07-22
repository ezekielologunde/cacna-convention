"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { createAttendeeClient } from "@/lib/supabase/client";

// Supabase's own default minimum -- matches what the backend would reject
// anyway, so this catches it client-side with a clearer message instead of
// surfacing the API's generic error text.
const MIN_PASSWORD_LENGTH = 6;

export function SetPasswordForm({
  passwordLabel,
  confirmLabel,
  saveCta,
  savingCta,
  successMessage,
  errorMessage,
  mismatchError,
  tooShortError,
}: {
  passwordLabel: string;
  confirmLabel: string;
  saveCta: string;
  savingCta: string;
  successMessage: string;
  errorMessage: string;
  mismatchError: string;
  tooShortError: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setErrorText(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus("error");
      setErrorText(tooShortError);
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorText(mismatchError);
      return;
    }

    const supabase = createAttendeeClient();
    // Sets/updates the password directly -- the attendee already has a
    // valid session (from their magic-link sign-in), so no separate
    // current-password check is needed the way a password-authenticated
    // account would require. This is what lets a magic-link-only account
    // add email+password as an alternative sign-in method going forward.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setStatus("saved");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label>
          <span className="sr-only">{passwordLabel}</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder={passwordLabel}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setStatus("idle");
            }}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
          />
        </label>
        <label>
          <span className="sr-only">{confirmLabel}</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder={confirmLabel}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setStatus("idle");
            }}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" disabled={status === "saving"} className="self-start">
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
