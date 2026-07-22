import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Briefcase } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { RegisterCta } from "@/components/register/RegisterCta";
import { AgendaTimeline } from "@/components/schedule/AgendaTimeline";
import { PersonCard } from "@/components/ui/PersonCard";
import {
  businessGroupFellowship,
  businessGroupAgenda,
  businessGroupExecutives,
  kingdomEconomicsMessage,
} from "@/lib/content/business-group-program";
import { mainGalleryPhotos } from "@/lib/content/gallery";
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
      {/* tone="blue": Business Group is a structured/institutional
          ministry, grouped with CACMA, Youth, and Christian Education --
          red is reserved for the family/nurture ministries (Children,
          Good Women, Ministers' Wives). */}
      <PageHero
        eyebrow={t("moderatorsLabel")}
        title={businessGroupFellowship.title}
        subtitle={businessGroupFellowship.moderators.join(", ")}
        variant="split"
        photoSrc="/photos/gallery/IMG-20250719-WA0045.jpg"
        stat={{ label: t("dateLabel"), value: businessGroupFellowship.date }}
        tone="blue"
        icon={Briefcase}
      />
      <PhotoStrip photos={mainGalleryPhotos.slice(6, 9)} caption="From the 2025 convention" />
      <div className="mx-auto w-full max-w-[clamp(20rem,90vw,60rem)] px-6 py-12">
        <section>
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("foundingHeading")}</h2>
          <p className="mt-3 text-sm text-[var(--color-muted)]">{businessGroupFellowship.founding}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("orderHeading")}</h2>
          <div className="mt-4">
            <AgendaTimeline
              items={businessGroupAgenda}
              timeLabel={t("timeLabel")}
              programLabel={t("programLabel")}
              speakerLabel={t("speakerLabel")}
              tone="blue"
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-lg text-[var(--color-fg)]">{t("executivesHeading")}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {businessGroupExecutives.map((member) => (
              <PersonCard key={member.name} name={member.name} role={member.role} tone="blue" />
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
      <RegisterCta locale={locale} />
    </>
  );
}
