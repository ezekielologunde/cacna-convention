import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { ProfileForm } from "@/components/ui/ProfileForm";
import { createAttendeeClient } from "@/lib/supabase/server";

const STATUS_KEYS = {
  pending: "statusPending",
  paid: "statusPaid",
  failed: "statusFailed",
  refunded: "statusRefunded",
} as const;

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Account");
  const tRegisterConfirmation = await getTranslations("RegisterConfirmation");

  const supabase = await createAttendeeClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName = "";
  let registrations: { id: string; church_name: string | null; contact_name: string; status: string; total_amount_cents: number; created_at: string }[] = [];
  let storeOrders: { id: string; status: string; total_amount_cents: number; created_at: string }[] = [];

  if (user) {
    const [{ data: profile }, { data: regs }, { data: orders }] = await Promise.all([
      supabase.from("attendee_profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("registrations")
        .select("id, church_name, contact_name, status, total_amount_cents, created_at")
        .eq("attendee_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("store_orders")
        .select("id, status, total_amount_cents, created_at")
        .eq("attendee_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    fullName = profile?.full_name ?? "";
    registrations = regs ?? [];
    storeOrders = orders ?? [];
  }

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
          <>
            <Card padding="lg">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("signedInHeading")}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{user.email}</p>
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <SignOutButton
                  scope="site"
                  redirectTo={`/${locale}/account`}
                  signingOutLabel={t("signingOutCta")}
                >
                  {t("signOutCta")}
                </SignOutButton>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("profileHeading")}</h2>
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <ProfileForm
                  userId={user.id}
                  initialFullName={fullName}
                  nameLabel={t("fullNameLabel")}
                  saveCta={t("saveCta")}
                  savingCta={t("savingCta")}
                  savedMessage={t("saveSuccess")}
                  errorMessage={t("saveError")}
                />
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("registrationsHeading")}</h2>
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                {registrations.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">{t("noRegistrations")}</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {registrations.map((reg) => (
                      <li
                        key={reg.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] p-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--color-fg)]">
                            {reg.church_name ?? reg.contact_name}
                          </p>
                          <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
                            {tRegisterConfirmation(STATUS_KEYS[reg.status as keyof typeof STATUS_KEYS] ?? "statusPending")} · ${(reg.total_amount_cents / 100).toFixed(2)}
                          </p>
                        </div>
                        <Link
                          href={`/${locale}/register/confirmation?registration=${reg.id}`}
                          className="text-sm font-semibold whitespace-nowrap text-[var(--color-red-text)] hover:underline"
                        >
                          {t("viewCta")}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("ordersHeading")}</h2>
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                {storeOrders.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">{t("noOrders")}</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {storeOrders.map((order) => (
                      <li
                        key={order.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] p-4"
                      >
                        <p className="text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
                          {tRegisterConfirmation(STATUS_KEYS[order.status as keyof typeof STATUS_KEYS] ?? "statusPending")} · ${(order.total_amount_cents / 100).toFixed(2)}
                        </p>
                        <Link
                          href={`/${locale}/store/confirmation?order=${order.id}`}
                          className="text-sm font-semibold whitespace-nowrap text-[var(--color-red-text)] hover:underline"
                        >
                          {t("viewCta")}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </>
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
