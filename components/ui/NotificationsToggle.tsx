"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NotificationsToggle({
  initialSubscribed,
  subscribedLabel,
  unsubscribedLabel,
  subscribeCta,
  unsubscribeCta,
  errorMessage,
}: {
  initialSubscribed: boolean;
  subscribedLabel: string;
  unsubscribedLabel: string;
  subscribeCta: string;
  unsubscribeCta: string;
  errorMessage: string;
}) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function toggle() {
    setStatus("saving");
    try {
      const response = await fetch("/api/account/notifications", {
        method: subscribed ? "DELETE" : "POST",
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setSubscribed((current) => !current);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[var(--color-muted)]">
          {subscribed ? subscribedLabel : unsubscribedLabel}
        </span>
        <Button type="button" variant="outline" onClick={toggle} disabled={status === "saving"}>
          {subscribed ? unsubscribeCta : subscribeCta}
        </Button>
      </div>
      {status === "error" && (
        <span role="alert" className="text-sm font-semibold text-[var(--color-red-text)]">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
