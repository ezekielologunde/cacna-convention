"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "submitting" | "success" | "already" | "error";

// Real footer newsletter signup (POST /api/newsletter, app/api/newsletter/route.ts).
// A hidden `website` honeypot field is the only spam mitigation -- real
// visitors never see or fill it in; a bot that fills every field it finds
// gets a normal-looking success response with no row ever written (handled
// server-side, this component just carries the field's value through).
export function NewsletterForm() {
  const t = useTranslations("Footer");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus(json.status === "already_subscribed" ? "already" : "success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "already") {
    return (
      <p className="text-sm font-semibold text-white">
        {status === "success" ? t("newsletterSuccess") : t("newsletterAlready")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="newsletter-email">
        {t("newsletterPlaceholder")}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("newsletterPlaceholder")}
        className="min-h-11 flex-1 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-[var(--color-gold)] focus:outline-none"
      />
      {/* Honeypot -- off-screen via absolute positioning (not display:none,
          which some bots skip but still fill in fields merely positioned
          off-canvas). tabIndex/autoComplete keep it out of the way for
          keyboard and autofill users too. */}
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
      <button
        type="submit"
        disabled={status === "submitting"}
        className="min-h-11 flex-none rounded-full px-5 text-sm font-bold text-[#16121a] disabled:opacity-60"
        style={{ background: "var(--color-gold)" }}
      >
        {status === "submitting" ? "…" : t("newsletterCta")}
      </button>
      {status === "error" ? (
        <p role="alert" className="text-xs text-white/80">
          {t("newsletterError")}
        </p>
      ) : null}
    </form>
  );
}
