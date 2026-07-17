import { requireAdmin } from "@/lib/supabase/require-admin";

export default async function AdminHomePage() {
  const { user } = await requireAdmin();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-2 text-[var(--color-muted)]">Signed in as {user.email}</p>
    </div>
  );
}
