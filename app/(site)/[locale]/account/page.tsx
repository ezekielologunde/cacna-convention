import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { createAttendeeClient } from "@/lib/supabase/server";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Account");

  const supabase = await createAttendeeClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} tone="red" />
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <Card padding="lg">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("preferencesHeading")}</h2>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <span className="text-[var(--color-muted)]">{t("themeLabel")}</span>
            <ThemeToggle />
          </div>
        </Card>

        {user ? (
          <Card padding="lg">
            <h2 className="font-display text-lg text-[var(--color-fg)]">{t("signedInHeading")}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{user.email}</p>
            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
              <SignOutButton scope="site" redirectTo={`/${locale}/account`}>
                {t("signOutCta")}
              </SignOutButton>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <h2 className="font-display text-lg text-[var(--color-fg)]">{t("signInHeading")}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{t("signInPrompt")}</p>
            <div className="mt-4">
              <Button href={`/${locale}/account/login`}>{t("signInCta")}</Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
