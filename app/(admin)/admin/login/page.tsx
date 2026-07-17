"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Admin sign in</h1>
      <label className="flex flex-col gap-1">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="rounded border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      {error ? (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="rounded bg-[var(--color-brand)] px-4 py-2 text-[var(--color-brand-contrast)]"
      >
        Sign in
      </button>
    </form>
  );
}
