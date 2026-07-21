import Link from "next/link";
import { ClipboardList, MapPinned, HandHeart, LayoutGrid } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  { key: "register", href: "/register", icon: ClipboardList },
  { key: "planVisit", href: "/plan-your-visit", icon: MapPinned },
  { key: "give", href: "/give", icon: HandHeart },
  { key: "programs", href: "/schedule", icon: LayoutGrid },
] as const;

export function NextSteps({
  locale,
  labels,
  descriptions,
}: {
  locale: string;
  labels: Record<(typeof STEPS)[number]["key"], string>;
  descriptions: Record<(typeof STEPS)[number]["key"], string>;
}) {
  return (
    <section className="px-6 py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4 2xl:max-w-6xl">
        {STEPS.map((step, i) => (
          <Reveal key={step.key} delay={i * 60}>
            <Link
              href={`/${locale}${step.href}`}
              className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] px-4 py-6 text-center transition-colors hover:border-[var(--color-red-text)]"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-red-text)] transition-colors group-hover:bg-[var(--color-red-text)] group-hover:text-white"
                style={{ background: "var(--color-red-light)" }}
              >
                <step.icon size={19} strokeWidth={2} />
              </span>
              <span className="font-display text-sm text-[var(--color-fg)]">{labels[step.key]}</span>
              <span className="text-xs text-[var(--color-muted)]">{descriptions[step.key]}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
