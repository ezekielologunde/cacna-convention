import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { newsEvents, type NewsEvent } from "@/lib/content/news-events";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function dateBadge(iso: string) {
  const [, monthStr, dayStr] = iso.split("-");
  return { month: MONTHS[Number(monthStr) - 1], day: dayStr };
}

function dateLabel(ev: NewsEvent) {
  const start = new Date(`${ev.date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  if (!ev.endDate) return start;
  const end = new Date(`${ev.endDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `${start} – ${end}`;
}

type PastEdition = {
  year: number;
  theme: string;
  starts_on: string;
  ends_on: string;
  venue_name: string;
};

export function ConventionTimeline({
  heading,
  cta,
  locale,
  pastEdition,
  formatDate,
  justConcludedKicker,
  justConcludedCta,
  pastConventionsCta,
}: {
  heading: string;
  cta: string;
  locale: string;
  pastEdition: PastEdition | null;
  formatDate: (dateStr: string) => string;
  justConcludedKicker: string;
  justConcludedCta: string;
  pastConventionsCta: string;
}) {
  // Only genuinely future-dated (or still-running) items belong on a
  // homepage "what's next" band -- a past-tense announcement (e.g. a
  // leadership transition note) living in the same content array as real
  // future events would otherwise render here under a heading that
  // promises upcoming programs. It still surfaces on /news, just not here.
  const now = new Date();
  const upcoming = newsEvents.filter((ev) => new Date(`${ev.endDate ?? ev.date}T23:59:59`) >= now);

  if (!pastEdition && upcoming.length === 0) return null;

  return (
    <section className="px-6 py-16 sm:py-20" style={{ background: "var(--color-surface)" }}>
      <div className="mx-auto max-w-4xl 2xl:max-w-5xl">
        <Reveal>
          <h2 className="text-center font-display text-3xl text-[var(--color-fg)] sm:text-4xl lg:text-5xl">{heading}</h2>
        </Reveal>

        {pastEdition && (
          <Reveal delay={60}>
            <Card
              padding="lg"
              className="mt-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left"
            >
              <div>
                <Badge tone="teal">{justConcludedKicker}</Badge>
                <h3 className="mt-3 font-display text-xl text-[var(--color-fg)] sm:text-2xl">
                  {pastEdition.year} — {pastEdition.theme}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-muted)] tabular-nums">
                  {formatDate(pastEdition.starts_on)} – {formatDate(pastEdition.ends_on)} · {pastEdition.venue_name}
                </p>
              </div>
              <div className="flex flex-none flex-wrap justify-center gap-3">
                <Button href={`/${locale}/gallery`} variant="secondary">
                  {justConcludedCta}
                </Button>
                <Button href={`/${locale}/archive`} variant="outline">
                  {pastConventionsCta}
                </Button>
              </div>
            </Card>
          </Reveal>
        )}

        {upcoming.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {upcoming.map((ev, i) => {
              const { month, day } = dateBadge(ev.date);
              const accent = i % 2 === 0 ? "coral" : "teal";
              return (
                <Reveal key={ev.title} delay={i * 90}>
                  {(() => {
                    const CardBody = (
                      <Card hoverable className="flex h-full items-start gap-5">
                        <div
                          className="flex flex-none flex-col items-center justify-center rounded-xl px-4 py-3 text-white"
                          style={{ background: accent === "coral" ? "var(--color-coral-deep)" : "var(--color-teal-deep)" }}
                        >
                          <span className="text-[10px] font-bold tracking-wider">{month}</span>
                          <span className="font-display text-xl leading-none">{day}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display text-lg leading-tight text-[var(--color-fg)]">{ev.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">{ev.description}</p>
                          <span
                            className="mt-2 block text-xs font-semibold"
                            style={{ color: accent === "coral" ? "var(--color-coral-text)" : "var(--color-teal-text)" }}
                          >
                            {dateLabel(ev)}
                          </span>
                        </div>
                      </Card>
                    );
                    return ev.moreInfoUrl ? (
                      <a href={ev.moreInfoUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                        {CardBody}
                      </a>
                    ) : (
                      <Link href={`/${locale}/news`} className="block h-full">
                        {CardBody}
                      </Link>
                    );
                  })()}
                </Reveal>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 font-semibold text-[var(--color-coral-text)] underline"
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
