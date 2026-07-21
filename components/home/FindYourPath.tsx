import Link from "next/link";
import { UserPlus, RotateCcw, Users, Mic2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const PERSONAS = [
  {
    key: "firstTime",
    icon: UserPlus,
    links: [
      { key: "register", href: "/register" },
      { key: "planVisit", href: "/plan-your-visit" },
      { key: "schedule", href: "/schedule" },
    ],
  },
  {
    key: "returning",
    icon: RotateCcw,
    links: [
      { key: "register", href: "/register" },
      { key: "news", href: "/news" },
      { key: "give", href: "/give" },
    ],
  },
  {
    key: "groupLeader",
    icon: Users,
    links: [
      { key: "register", href: "/register" },
      { key: "planVisit", href: "/plan-your-visit" },
      { key: "contact", href: "/contact" },
    ],
  },
  {
    key: "minister",
    icon: Mic2,
    links: [
      { key: "schedule", href: "/schedule" },
      { key: "contact", href: "/contact" },
      { key: "about", href: "/about" },
    ],
  },
] as const;

export function FindYourPath({
  locale,
  heading,
  intro,
  personaLabels,
  personaBodies,
  linkLabels,
}: {
  locale: string;
  heading: string;
  intro: string;
  personaLabels: Record<(typeof PERSONAS)[number]["key"], string>;
  personaBodies: Record<(typeof PERSONAS)[number]["key"], string>;
  linkLabels: Record<string, string>;
}) {
  return (
    <section className="px-6 py-16 sm:py-20">
      <Reveal className="mx-auto max-w-5xl 2xl:max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl leading-[1.05] tracking-tight text-[var(--color-fg)] sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[var(--color-muted)]">{intro}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((persona, i) => (
            <Reveal key={persona.key} delay={i * 70}>
              <div className="flex h-full flex-col rounded-3xl border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-white"
                  style={{ background: i % 2 === 0 ? "var(--gradient-cta)" : "var(--color-blue-deep)" }}
                >
                  <persona.icon size={19} strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-lg text-[var(--color-fg)]">{personaLabels[persona.key]}</h3>
                <p className="mt-2 text-base text-[var(--color-muted)]">{personaBodies[persona.key]}</p>
                <ul className="mt-5 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
                  {persona.links.map((link) => (
                    <li key={link.key}>
                      <Link
                        href={`/${locale}${link.href}`}
                        className="text-sm font-semibold text-[var(--color-red-text)] underline underline-offset-2"
                      >
                        {linkLabels[link.key]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
