import Link from "next/link";
import { Flame, Baby, ShieldCheck, Briefcase, Sparkles, HeartHandshake, BookOpen } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

// Same icon/tone assignment established on each sub-conference page's own
// PageHero -- red = family/nurture ministries, blue = structured/
// institutional ministries. Kept in sync manually since the two live in
// different route trees; if a page's icon/tone ever changes, update here
// too.
const PROGRAMS = [
  { key: "youth", href: "/youth", icon: Flame, tone: "blue" },
  { key: "children", href: "/children", icon: Baby, tone: "red" },
  { key: "goodWomen", href: "/good-women", icon: Sparkles, tone: "red" },
  { key: "ministersWives", href: "/ministers-wives", icon: HeartHandshake, tone: "red" },
  { key: "cacma", href: "/cacma", icon: ShieldCheck, tone: "blue" },
  { key: "christianEducation", href: "/christian-education", icon: BookOpen, tone: "blue" },
  { key: "businessGroup", href: "/business-group", icon: Briefcase, tone: "blue" },
] as const;

export function ProgramGrid({
  locale,
  sectionLabel,
  heading,
  intro,
  cta,
  cardCta,
  labels,
}: {
  locale: string;
  sectionLabel: string;
  heading: string;
  intro: string;
  cta: string;
  cardCta: string;
  labels: Record<(typeof PROGRAMS)[number]["key"], string>;
}) {
  return (
    <section className="px-6 py-16 sm:py-20" style={{ background: "var(--color-surface)" }}>
      <div className="mx-auto max-w-5xl 2xl:max-w-6xl">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold tracking-[0.15em] text-[var(--color-red-text)] uppercase">
              {sectionLabel}
            </span>
            <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-tight text-[var(--color-fg)] sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[var(--color-muted)]">{intro}</p>
          </div>
          <Link
            href={`/${locale}/schedule`}
            className="inline-flex min-h-11 flex-none items-center font-semibold text-[var(--color-red-text)] underline underline-offset-2"
          >
            {cta}
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((program, i) => {
            const accentText = program.tone === "blue" ? "var(--color-blue-text)" : "var(--color-red-text)";
            const accentGradient = program.tone === "blue" ? "var(--gradient-hero-alt)" : "var(--gradient-hero)";
            return (
              <Reveal key={program.key} delay={i * 60}>
                <Link
                  href={`/${locale}${program.href}`}
                  className="group flex h-full flex-col rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-white"
                    style={{ background: accentGradient }}
                  >
                    <program.icon size={19} strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 font-display text-base text-[var(--color-fg)]">{labels[program.key]}</h3>
                  <span
                    className="mt-auto pt-4 text-xs font-bold tracking-wide uppercase transition-colors group-hover:underline"
                    style={{ color: accentText }}
                  >
                    {cardCta}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
