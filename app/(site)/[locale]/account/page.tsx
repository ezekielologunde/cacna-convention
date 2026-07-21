import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Account");

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} tone="coral" />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Card padding="lg">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("preferencesHeading")}</h2>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <span className="text-[var(--color-muted)]">{t("themeLabel")}</span>
            <ThemeToggle />
          </div>
        </Card>
      </div>
    </>
  );
}
