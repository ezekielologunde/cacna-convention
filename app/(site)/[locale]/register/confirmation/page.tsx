import { getTranslations, setRequestLocale } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/server";

export default async function RegisterConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ registration?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("RegisterConfirmation");

  const { registration: registrationId } = await searchParams;

  let registration: { registration_type: string; church_name: string | null; contact_name: string; status: string; total_amount_cents: number } | null = null;
  let registrants: { full_name: string; category: string }[] = [];

  if (registrationId) {
    const supabase = createServiceClient();
    const { data: reg } = await supabase
      .from("registrations")
      .select("registration_type, church_name, contact_name, status, total_amount_cents")
      .eq("id", registrationId)
      .maybeSingle();

    if (reg) {
      registration = reg;
      const { data: regs } = await supabase
        .from("registrants")
        .select("full_name, category")
        .eq("registration_id", registrationId)
        .order("created_at", { ascending: true });
      registrants = regs ?? [];
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full text-white"
        style={{ background: "var(--gradient-cta)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-[48ch] text-[var(--color-muted)]">{t("body")}</p>

      {registration ? (
        <div className="mt-8 w-full rounded-2xl border border-[var(--color-border)] p-6 text-left shadow-[var(--shadow-card)]">
          {registration.church_name ? (
            <p className="font-display text-lg text-[var(--color-fg)]">{registration.church_name}</p>
          ) : null}
          <p className="text-sm text-[var(--color-muted)]">{registration.contact_name}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {registrants.map((r, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-fg)]">{r.full_name}</span>
                <span className="capitalize text-[var(--color-muted)]">{r.category.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
            <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {registration.status}
            </span>
            <span className="font-display text-xl text-[var(--color-fg)]">
              ${(registration.total_amount_cents / 100).toFixed(2)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
