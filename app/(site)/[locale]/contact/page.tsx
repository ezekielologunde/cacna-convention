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
    <div className="px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <ul className="mt-8 flex flex-col gap-6">
        {CONTACTS.map((contact) => (
          <li key={contact.email}>
            <p className="font-medium">
              {contact.name} — {t(contact.roleKey)}
            </p>
            <p className="text-sm text-[var(--color-muted)]">{contact.phone} · {contact.email}</p>
            <p className="text-sm text-[var(--color-muted)]">{contact.org}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
