"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { RequiredMark } from "@/components/ui/RequiredMark";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Floating "Chat with us" shortcut, site-wide. Opens a quick message form
 * in place (not a navigation) that posts to POST /api/support -- a
 * service-role route, since this needs to work for signed-out visitors too,
 * not just attendees with a session (see SupportTicketForm/Account page for
 * the signed-in, ticket-history-visible equivalent). Still not real-time
 * chat -- see the route's own comment on why that's deliberately out of
 * scope for now.
 */
export function ChatShortcut() {
  const t = useTranslations("Chat");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Same open/close behavior as PrimaryNav's dropdowns -- Escape returns
  // focus to the trigger, and a click outside the panel closes it.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t("heading")}
          className="fixed right-5 bottom-[5.5rem] z-30 w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-[var(--shadow-card)]"
        >
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("heading")}</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{t("intro")}</p>

          {status === "success" ? (
            <p role="status" className="mt-4 text-sm font-semibold text-[var(--color-blue-text)]">
              {t("successMessage")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
                <span>{t("nameLabel")}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
                <span>
                  {t("emailLabel")}
                  <RequiredMark />
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
                <span>
                  {t("subjectLabel")}
                  <RequiredMark />
                </span>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
                <span>
                  {t("messageLabel")}
                  <RequiredMark />
                </span>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
                />
              </label>
              {/* Honeypot -- see NewsletterForm.tsx's own comment on why
                  off-screen positioning (not display:none) is deliberate. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              {status === "error" && (
                <span role="alert" className="text-sm font-semibold text-[var(--color-red-text)]">
                  {t("errorMessage")}
                </span>
              )}
              <Button type="submit" disabled={status === "submitting"} className="self-start">
                {status === "submitting" ? t("submittingCta") : t("submitCta")}
              </Button>
            </form>
          )}
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label={t("openLabel")}
        title={t("openLabel")}
        onClick={() => setOpen((v) => !v)}
        className="bottom-safe fixed right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-red)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        style={{ background: "var(--gradient-cta)" }}
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    </>
  );
}
