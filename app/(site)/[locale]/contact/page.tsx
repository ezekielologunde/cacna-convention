import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { contacts } from "@/lib/content/contacts";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return pageMetadata({
    locale, path: "/contact", title: t("title"),
    description: "Contact the CACNA Convention Chairman, Secretary, or general inquiries.",
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <>
      <PageHero title={t("title")} tone="teal" />
      <div className="mx-auto max-w-3xl px-6 py-12 2xl:max-w-4xl">
      <ul className="flex flex-col gap-4">
        {contacts.map((contact) => (
          <li key={contact.email} className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]">
            <p className="font-semibold text-[var(--color-fg)]">
              {contact.name} — {t(contact.roleKey)}
            </p>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">{contact.org}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex min-h-11 items-center text-[var(--color-coral-text)] tabular-nums"
              >
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex min-h-11 items-center text-[var(--color-coral-text)]"
              >
                {contact.email}
              </a>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </>
  );
}
