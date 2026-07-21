import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { AgendaTable } from "@/components/schedule/AgendaTable";
import {
  businessGroupFellowship,
  businessGroupAgenda,
  businessGroupExecutives,
  kingdomEconomicsMessage,
} from "@/lib/content/business-group-program";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale, path: "/business-group", title: businessGroupFellowship.title,
    description: `${businessGroupFellowship.title} — ${businessGroupFellowship.date}, moderated by ${businessGroupFellowship.moderators.join(", ")}.`,
  });
}

export default async function BusinessGroupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("BusinessGroup");

  return (
    <>
      <PageHero
        eyebrow={t("moderatorsLabel")}
        title={businessGroupFellowship.title}
        subtitle={businessGroupFellowship.moderators.join(", ")}
        variant="split"
        stat={{ label: t("dateLabel"), value: businessGroupFellowship.date }}
      />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <section>
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("orderHeading")}</h2>
          <div className="mt-4">
            <AgendaTable
              items={businessGroupAgenda}
              timeLabel={t("timeLabel")}
              programLabel={t("programLabel")}
              speakerLabel={t("speakerLabel")}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executivesHeading")}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {businessGroupExecutives.map((member) => (
              <li
                key={member.name}
                className="rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
              >
                <p className="font-semibold text-[var(--color-fg)]">{member.name}</p>
                {member.role && (
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{member.role}</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{kingdomEconomicsMessage.title}</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {kingdomEconomicsMessage.verse} · {t("messageByLabel")}{" "}
            {kingdomEconomicsMessage.contributors.map((c, i) => (
              <span key={c.name}>
                {i > 0 && "; "}
                {c.name}, {c.title}
              </span>
            ))}
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-fg)]">
            {kingdomEconomicsMessage.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {kingdomEconomicsMessage.fullMessageNote && (
            <p className="mt-4 text-sm text-[var(--color-muted)] italic">
              {kingdomEconomicsMessage.fullMessageNote}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
