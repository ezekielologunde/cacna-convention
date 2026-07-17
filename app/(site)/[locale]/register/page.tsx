import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
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

  return (
    <div>
      {!edition ? (
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
              <span className="font-semibold text-[var(--color-maroon)] tabular-nums">
                {index + 1}.
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm font-semibold text-[var(--color-maroon)]">
          {registrationGuidelines.freeFoodNote}
        </p>
      </section>
    </div>
  );
}
