"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient, createAttendeeClient } from "@/lib/supabase/client";

/**
 * Shared by both the site's Account page and the admin dashboard --
 * `scope` picks which of the two distinctly-cookied clients (see
 * lib/supabase/client.ts) to sign out of, so signing out of one never
 * touches the other's session on a shared device.
 */
export function SignOutButton({
  scope,
  redirectTo,
  children,
}: {
  scope: "site" | "admin";
  redirectTo: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    const supabase = scope === "site" ? createAttendeeClient() : createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handleSignOut} disabled={pending}>
      {children}
    </Button>
  );
}
