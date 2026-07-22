import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { ProfileForm } from "@/components/ui/ProfileForm";
import { ChangeEmailForm } from "@/components/ui/ChangeEmailForm";
import { SetPasswordForm } from "@/components/ui/SetPasswordForm";
import { NotificationsToggle } from "@/components/ui/NotificationsToggle";
import { SupportTicketForm } from "@/components/ui/SupportTicketForm";
import { QrCode } from "@/components/ui/QrCode";
import { createAttendeeClient, createServiceClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { renderQrCodeSvg } from "@/lib/qr";

const TICKET_STATUS_KEYS = {
  open: "ticketStatusOpen",
  closed: "ticketStatusClosed",
} as const;

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
  let phone = "";
  let registrations: { id: string; church_name: string | null; contact_name: string; status: string; total_amount_cents: number; created_at: string }[] = [];
  let storeOrders: { id: string; status: string; total_amount_cents: number; created_at: string }[] = [];
  let tickets: { id: string; subject: string; status: string; created_at: string }[] = [];
  let isSubscribed = false;

  if (user) {
    const [{ data: profile }, { data: regs }, { data: orders }, { data: supportTickets }, { data: subscription }] = await Promise.all([
      supabase.from("attendee_profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
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
      supabase
        .from("support_tickets")
        .select("id, subject, status, created_at")
        .eq("attendee_id", user.id)
        .order("created_at", { ascending: false }),
      // newsletter_subscribers has no RLS policies of its own (service-role
      // only, see app/api/account/notifications/route.ts) -- read it with
      // the service client here rather than granting the attendee client
      // direct access to a table it has no legitimate reason to see beyond
      // its own single row.
      user.email
        ? createServiceClient().from("newsletter_subscribers").select("id").eq("email", user.email).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    fullName = profile?.full_name ?? "";
    phone = profile?.phone ?? "";
    registrations = regs ?? [];
    storeOrders = orders ?? [];
    tickets = supportTickets ?? [];
    isSubscribed = Boolean(subscription);
  }

  // Precomputed up front (rather than an async QrCode component rendered
  // inline per list item) -- an async Server Component nested inside a list
  // breaks the client reconciler once it reaches a plain (non-RSC) render
  // pass, same class of issue RegisterCta already has elsewhere on this
  // site. Only paid registrations get a check-in QR -- a pending/failed one
  // has nothing valid to check in with yet.
  const qrSvgByRegistrationId = new Map(
    await Promise.all(
      registrations
        .filter((reg) => reg.status === "paid")
        .map(async (reg) => [reg.id, await renderQrCodeSvg(`${SITE_URL}/register/confirmation?registration=${reg.id}`)] as const)
    )
  );

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
                  initialPhone={phone}
                  nameLabel={t("fullNameLabel")}
                  phoneLabel={t("phoneLabel")}
                  saveCta={t("saveCta")}
                  savingCta={t("savingCta")}
                  savedMessage={t("saveSuccess")}
                  errorMessage={t("saveError")}
                />
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("securityHeading")}</h2>
              <div className="mt-4 flex flex-col gap-6 border-t border-[var(--color-border)] pt-4">
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-[var(--color-muted)] uppercase">
                    {t("changeEmailHeading")}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{t("changeEmailIntro", { email: user.email ?? "" })}</p>
                  <div className="mt-3">
                    <ChangeEmailForm
                      newEmailLabel={t("newEmailLabel")}
                      saveCta={t("saveCta")}
                      savingCta={t("savingCta")}
                      successMessage={t("changeEmailSuccess")}
                      errorMessage={t("changeEmailError")}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-[var(--color-muted)] uppercase">
                    {t("setPasswordHeading")}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{t("setPasswordIntro")}</p>
                  <div className="mt-3">
                    <SetPasswordForm
                      passwordLabel={t("newPasswordLabel")}
                      confirmLabel={t("confirmPasswordLabel")}
                      saveCta={t("saveCta")}
                      savingCta={t("savingCta")}
                      successMessage={t("setPasswordSuccess")}
                      errorMessage={t("setPasswordError")}
                      mismatchError={t("setPasswordMismatch")}
                      tooShortError={t("setPasswordTooShort")}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("notificationsHeading")}</h2>
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <NotificationsToggle
                  initialSubscribed={isSubscribed}
                  subscribedLabel={t("notificationsSubscribed")}
                  unsubscribedLabel={t("notificationsUnsubscribed")}
                  subscribeCta={t("notificationsSubscribeCta")}
                  unsubscribeCta={t("notificationsUnsubscribeCta")}
                  errorMessage={t("notificationsError")}
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
                          <Link
                            href={`/${locale}/register/confirmation?registration=${reg.id}`}
                            className="mt-1 inline-block text-sm font-semibold whitespace-nowrap text-[var(--color-red-text)] hover:underline"
                          >
                            {t("viewCta")}
                          </Link>
                        </div>
                        {qrSvgByRegistrationId.has(reg.id) && (
                          <QrCode svg={qrSvgByRegistrationId.get(reg.id)!} label={t("qrCodeLabel")} />
                        )}
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

            <Card padding="lg">
              <h2 className="font-display text-lg text-[var(--color-fg)]">{t("supportHeading")}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{t("supportIntro")}</p>
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                {tickets.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">{t("noTickets")}</p>
                ) : (
                  <ul className="mb-6 flex flex-col gap-3">
                    {tickets.map((ticket) => (
                      <li
                        key={ticket.id}
                        className="rounded-xl border border-[var(--color-border)] p-4"
                      >
                        <p className="font-semibold text-[var(--color-fg)]">{ticket.subject}</p>
                        <p className="mt-1 text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
                          {t(TICKET_STATUS_KEYS[ticket.status as keyof typeof TICKET_STATUS_KEYS] ?? "ticketStatusOpen")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <SupportTicketForm
                  userId={user.id}
                  subjectLabel={t("ticketSubjectLabel")}
                  messageLabel={t("ticketMessageLabel")}
                  submitCta={t("ticketSubmitCta")}
                  submittingCta={t("ticketSubmittingCta")}
                  errorMessage={t("ticketSubmitError")}
                />
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
