import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { SignOutButton } from "@/components/ui/SignOutButton";

export default async function AdminHomePage() {
  const { user } = await requireAdmin();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-2 text-[var(--color-muted)]">Signed in as {user.email}</p>

      <div className="mt-6">
        <Link
          href="/admin/registrations"
          className="inline-flex items-center rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-fg)] hover:border-[var(--color-red-text)]"
        >
          Registrants & purchases →
        </Link>
      </div>

      <div className="mt-6">
        <SignOutButton scope="admin" redirectTo="/admin/login">
          Sign out
        </SignOutButton>
      </div>
    </div>
  );
}
