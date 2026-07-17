import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveEdition } from "@/lib/editions";
import { RegisterPageClient } from "@/components/register/RegisterPageClient";

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

  if (!edition) {
    return (
      <div className="px-6 py-12">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{t("notOpenYet")}</p>
      </div>
    );
  }

  return <RegisterPageClient editionId={edition.id} />;
}
