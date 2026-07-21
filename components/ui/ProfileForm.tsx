"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createAttendeeClient } from "@/lib/supabase/client";

export function ProfileForm({
  userId,
  initialFullName,
  nameLabel,
  saveCta,
  savingCta,
  savedMessage,
  errorMessage,
}: {
  userId: string;
  initialFullName: string;
  nameLabel: string;
  saveCta: string;
  savingCta: string;
  savedMessage: string;
  errorMessage: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const supabase = createAttendeeClient();
    const { error } = await supabase
      .from("attendee_profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", userId);

    if (error) {
      setStatus("error");
      return;
    }
    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex-1">
        <span className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
          {nameLabel}
        </span>
        <input
          type="text"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            setStatus("idle");
          }}
          className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
        />
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" disabled={status === "saving"}>
          {status === "saving" ? savingCta : saveCta}
        </Button>
        {status === "saved" && (
          <span role="status" className="text-sm font-semibold text-[var(--color-blue-text)]">
            {savedMessage}
          </span>
        )}
        {status === "error" && (
          <span role="alert" className="text-sm font-semibold text-[var(--color-red-text)]">
            {errorMessage}
          </span>
        )}
      </div>
    </form>
  );
}
