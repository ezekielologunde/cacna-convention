import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export type PricingCardTier = {
  id: string;
  priceLabel: string; // e.g. "$125" or "Free" -- pre-formatted by the caller
  dateLabel: string; // e.g. "Through Jan 31, 2027" or "At the Convention Ground"
  isCurrent: boolean;
};

export type PricingCardCategory = {
  key: string;
  label: string;
  tiers: PricingCardTier[];
};

// Bigger, visually distinct fee cards for the Register page -- one per
// registrant category, each showing every tier in that category's price
// ladder rather than only today's active rate, so visitors can see the
// whole early-bird schedule at a glance.
export function PricingCards({
  categories,
  currentRateLabel,
}: {
  categories: PricingCardCategory[];
  currentRateLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {categories.map((cat) => (
        <Card key={cat.key} padding="lg" className="flex flex-col">
          <h3 className="font-display text-xl text-[var(--color-fg)]">{cat.label}</h3>
          <ul className="mt-5 flex flex-1 flex-col gap-4">
            {cat.tiers.map((tier) => (
              <li
                key={tier.id}
                className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 ${
                  tier.isCurrent ? "bg-[var(--color-red-light)]" : ""
                }`}
              >
                <span>
                  <span className="font-display text-2xl text-[var(--color-fg)]">{tier.priceLabel}</span>
                  <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{tier.dateLabel}</span>
                </span>
                {tier.isCurrent ? (
                  <Badge tone="red" className="flex-none">
                    {currentRateLabel}
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
