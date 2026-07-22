"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { createAttendeeClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "sent" | "error";

const tabClass = (active: boolean) =>
  `inline-flex min-h-11 items-center px-4 text-sm font-semibold transition-colors ${
    active
      ? "border-b-2 border-[var(--color-red-text)] text-[var(--color-red-text)]"
      : "border-b-2 border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
  }`;

export default function AccountLoginPage() {
  const t = useTranslations("AccountLogin");
  const locale = useLocale();
  const router = useRouter();
  // Magic link is the default -- it's the only method that's always
  // available, since a password isn't guaranteed to exist yet (see
  // components/ui/SetPasswordForm.tsx, the only place one gets created).
  const [mode, setMode] = useState<"link" | "password">("link");
  const linkTabRef = useRef<HTMLButtonElement>(null);
  const passwordTabRef = useRef<HTMLButtonElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  function onTabsKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = mode === "link" ? "password" : "link";
    setMode(next);
    setStatus("idle");
    (next === "link" ? linkTabRef : passwordTabRef).current?.focus();
  }

  async function handleLinkSubmit(event: FormEvent) {
    event.preventDefault();
    if (!captchaToken) return;
    setStatus("submitting");

    const supabase = createAttendeeClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/account`,
        captchaToken,
      },
    });

    // Supabase's own API never reveals whether an email matched an
    // existing account either way (signInWithOtp silently creates a new
    // user if none exists) -- an `error` here is a real failure (bad
    // captcha, rate limit, network), not an enumeration signal, so it's
    // safe and correct to show it as-is.
    setStatus(error ? "error" : "sent");
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    if (!captchaToken) return;
    setStatus("submitting");

    const supabase = createAttendeeClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (error) {
      setStatus("error");
      return;
    }
    // Unlike the magic-link path, a successful password sign-in already has
    // a real session -- no email confirmation step to wait on.
    router.push(`/${locale}/account`);
  }

  if (status === "sent") {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ background: "var(--gradient-cta)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </span>
        <h1 className="mt-6 font-display text-3xl text-[var(--color-fg)] sm:text-4xl">
          {t("checkEmailTitle")}
        </h1>
        <p className="mt-4 max-w-[48ch] text-[var(--color-muted)]">{t("checkEmailBody")}</p>
      </div>
    );
  }

  return (
    <>
      <PageHero title={t("title")} tone="red" />
      <div className="mx-auto max-w-md px-6 py-12">
        <Card padding="lg">
          <div role="tablist" className="mb-4 flex gap-2 border-b border-[var(--color-border)]" onKeyDown={onTabsKeyDown}>
            <button
              ref={linkTabRef}
              id="login-tab-link"
              role="tab"
              aria-selected={mode === "link"}
              aria-controls="login-panel"
              tabIndex={mode === "link" ? 0 : -1}
              type="button"
              onClick={() => {
                setMode("link");
                setStatus("idle");
              }}
              className={tabClass(mode === "link")}
            >
              {t("emailLinkTab")}
            </button>
            <button
              ref={passwordTabRef}
              id="login-tab-password"
              role="tab"
              aria-selected={mode === "password"}
              aria-controls="login-panel"
              tabIndex={mode === "password" ? 0 : -1}
              type="button"
              onClick={() => {
                setMode("password");
                setStatus("idle");
              }}
              className={tabClass(mode === "password")}
            >
              {t("passwordTab")}
            </button>
          </div>

          <div
            id="login-panel"
            role="tabpanel"
            aria-labelledby={mode === "link" ? "login-tab-link" : "login-tab-password"}
          >
            <form onSubmit={mode === "link" ? handleLinkSubmit : handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-fg)]">
                  {t("emailLabel")}
                  <RequiredMark />
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
                />
              </div>
              {mode === "password" && (
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-fg)]">
                    {t("passwordLabel")}
                    <RequiredMark />
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
                  />
                </div>
              )}
              <TurnstileWidget onVerify={setCaptchaToken} />
              {!captchaToken && status !== "submitting" ? (
                <p className="text-xs text-[var(--color-muted)]">{t("captchaPending")}</p>
              ) : null}
              {status === "error" ? (
                <p role="alert" className="text-sm text-[var(--color-red-text)]">
                  {mode === "link" ? t("errorMessage") : t("passwordErrorMessage")}
                </p>
              ) : null}
              <Button type="submit" disabled={!captchaToken || status === "submitting"}>
                {mode === "link"
                  ? status === "submitting" ? t("submitting") : t("submitCta")
                  : status === "submitting" ? t("passwordSubmitting") : t("passwordSubmitCta")}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
