import { getTranslations, setRequestLocale } from "next-intl/server";

type ContactRoleKey = "chairman" | "secretary" | "generalInquiries";

const CONTACTS: Array<{
  name: string;
  roleKey: ContactRoleKey;
  phone: string;
  email: string;
  org: string;
}> = [
  {
    name: "Pastor David Adenodi",
    roleKey: "chairman",
    phone: "301-440-7033",
    email: "cacnaconvention@gmail.com",
    org: "C.A.C. Vineyard of Comfort, 6408 Princess Garden Parkway, Lanham, MD 20706",
  },
  {
    name: "Pastor Timothy Famojuro",
    roleKey: "secretary",
    phone: "917-709-1892",
    email: "ftimothy54@aol.com",
    org: "C.A.C. FITA, Brooklyn, NY",
  },
  {
    name: "Pastor Joseph Olawale",
    roleKey: "generalInquiries",
    phone: "305-469-0346",
    email: "cacna@hotmail.com",
    org: "Christ Apostolic Church DFW Metroplex, Sanctuary of Power and Praise, 612 E. 2nd Street, Irving, TX 75060",
  },
];

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{t("title")}</h1>
      <ul className="mt-8 flex flex-col gap-4">
        {CONTACTS.map((contact) => (
          <li key={contact.email} className="rounded-2xl border border-[var(--color-border)] p-5">
            <p className="font-semibold text-[var(--color-fg)]">
              {contact.name} — {t(contact.roleKey)}
            </p>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">{contact.org}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <a href={`tel:${contact.phone}`} className="text-[var(--color-maroon)] tabular-nums">
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="text-[var(--color-maroon)]">
                {contact.email}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
