import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  businessGroupFellowship,
  businessGroupAgenda,
  businessGroupExecutives,
  kingdomEconomicsMessage,
} from "@/lib/content/business-group-program";

export default async function BusinessGroupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("BusinessGroup");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{businessGroupFellowship.title}</h1>

      <div className="mt-4 flex flex-col gap-1 text-sm text-[var(--color-muted)]">
        <p>{businessGroupFellowship.date}</p>
        <p>
          <span className="font-semibold text-[var(--color-fg)]">{t("moderatorsLabel")}: </span>
          {businessGroupFellowship.moderators.join(", ")}
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg text-[var(--color-fg)]">{t("orderHeading")}</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs font-bold tracking-wide text-[var(--color-muted)] uppercase">
                <th className="px-4 py-3">{t("timeLabel")}</th>
                <th className="px-4 py-3">{t("programLabel")}</th>
                <th className="px-4 py-3">{t("speakerLabel")}</th>
              </tr>
            </thead>
            <tbody>
              {businessGroupAgenda.map((item, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="px-4 py-3 tabular-nums text-[var(--color-muted)]">{item.time}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-fg)]">{item.event}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{item.speaker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executivesHeading")}</h2>
        <ul className="mt-4 flex flex-col gap-4">
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
      </section>
    </div>
  );
}
