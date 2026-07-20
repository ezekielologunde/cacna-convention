import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { getActivePricingForEdition } from "@/lib/pricing";
import { RegisterPageClient } from "@/components/register/RegisterPageClient";
import { registrationGuidelines } from "@/lib/content/registration-guidelines";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Register");

  const supabase = await createClient();
  const edition = await getActiveEdition(supabase);
  // An edition row existing (status upcoming/current) doesn't mean
  // registration is actually open -- pricing_tiers is the real signal
  // (empty for 2027 as of this writing; it opens in October 2026). Without
  // this check, the form renders and accepts submissions with no pricing
  // behind them the moment an edition row is created for the next year.
  const tiers = edition ? await getActivePricingForEdition(supabase, edition.id) : [];
  const registrationOpen = Boolean(edition) && tiers.length > 0;

  return (
    <div>
      {!registrationOpen ? (
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-4 max-w-[48ch] text-[var(--color-muted)]">{t("notOpenYet")}</p>
        </div>
      ) : (
        <RegisterPageClient />
      )}

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="font-display text-lg text-[var(--color-fg)]">{t("guidelinesHeading")}</h2>
        <ol className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-muted)]">
          {registrationGuidelines.items.map((item, index) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="font-semibold text-[var(--color-coral-text)] tabular-nums">
                {index + 1}.
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm font-semibold text-[var(--color-coral-text)]">
          {registrationGuidelines.freeFoodNote}
        </p>
      </section>
    </div>
  );
}
