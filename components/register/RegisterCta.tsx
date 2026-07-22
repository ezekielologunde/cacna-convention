import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";

// A closing registration prompt for pages that otherwise have no path back
// to /register -- reuses the same open/coming-soon copy and button-variant
// logic as the homepage's Registration band (see app/(site)/[locale]/page.tsx)
// so the messaging stays consistent no matter which page a visitor lands on.
//
// Tried wrapping this in next/cache's unstable_cache (2026-07-21) to
// collapse the DB round-trip across the 7+ pages this renders on --
// reverted immediately: unstable_cache requires Next's request-scoped
// incremental-cache runtime, which doesn't exist under Vitest and threw
// "Invariant: incrementalCache missing" on every test that renders this
// component (37 failures). Not worth it for this component's actual
// query cost; revisit with a test-environment-safe cache primitive if this
// becomes a real bottleneck.
export async function RegisterCta({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "RegisterCta" });

  const supabase = await createClient();
  const edition = await getActiveEdition(supabase);
  const tiers = edition ? await getActivePricingForEdition(supabase, edition.id) : [];
  const registrationOpen = Boolean(edition) && tiers.length > 0;

  return (
    <section className="px-6 py-16" style={{ background: "var(--color-surface)" }}>
      <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
        <h2 className="font-display text-2xl text-[var(--color-fg)] sm:text-3xl">{t("heading")}</h2>
        <p className="mx-auto mt-3 max-w-[48ch] text-[var(--color-muted)]">
          {registrationOpen ? t("bodyOpen") : t("bodyComingSoon")}
        </p>
        <div className="mt-6 flex justify-center">
          <Button href={`/${locale}/register`} variant={registrationOpen ? "primary" : "outline"}>
            {registrationOpen ? t("ctaOpen") : t("ctaComingSoon")}
          </Button>
        </div>
      </div>
    </section>
  );
}
