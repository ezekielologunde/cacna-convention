import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
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

export function UpcomingPrograms({ heading, cta, locale }: { heading: string; cta: string; locale: string }) {
  if (newsEvents.length === 0) return null;

  return (
    <section className="px-6 py-16" style={{ background: "var(--color-surface)" }}>
      <div className="mx-auto max-w-4xl 2xl:max-w-5xl">
        <Reveal>
          <h2 className="text-center font-display text-3xl text-[var(--color-fg)] sm:text-4xl">{heading}</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {newsEvents.map((ev, i) => {
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
