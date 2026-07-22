"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { createAttendeeClient } from "@/lib/supabase/client";

export function SupportTicketForm({
  userId,
  subjectLabel,
  messageLabel,
  submitCta,
  submittingCta,
  errorMessage,
}: {
  userId: string;
  subjectLabel: string;
  messageLabel: string;
  submitCta: string;
  submittingCta: string;
  errorMessage: string;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const supabase = createAttendeeClient();
    const { error } = await supabase
      .from("support_tickets")
      .insert({ attendee_id: userId, subject: subject.trim(), message: message.trim() });

    if (error) {
      setStatus("error");
      return;
    }
    setSubject("");
    setMessage("");
    setStatus("idle");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
        <span>
          {subjectLabel}
          <RequiredMark />
        </span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
        <span>
          {messageLabel}
          <RequiredMark />
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
        />
      </label>
      {status === "error" && (
        <span role="alert" className="text-sm font-semibold text-[var(--color-red-text)]">
          {errorMessage}
        </span>
      )}
      <Button type="submit" variant="outline" disabled={status === "submitting"} className="self-start">
        {status === "submitting" ? submittingCta : submitCta}
      </Button>
    </form>
  );
}
