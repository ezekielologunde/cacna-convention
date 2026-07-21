import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { Badge } from "@/components/ui/Badge";
import {
  christianEducationMaterials,
  conventionApparelDemo,
  goodWomenApparelDemo,
  youthApparelDemo,
  type StoreItem,
} from "@/lib/content/store-items";
import { pageMetadata } from "@/lib/metadata";

function ApparelCategory({
  label,
  items,
  demoLabel,
}: {
  label: string;
  items: StoreItem[];
  demoLabel: string;
}) {
  return (
    <div className="mt-8">
      <h3 className="font-display text-base text-[var(--color-fg)]">{label}</h3>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.name}
            className="relative flex flex-col justify-between rounded-2xl border border-dashed border-[var(--color-border)] p-5"
          >
            <Badge tone="coral" className="absolute top-4 right-4">
              {demoLabel}
            </Badge>
            <p className="pr-14 font-semibold text-[var(--color-fg)]">{item.name}</p>
            <p className="mt-3 font-display text-lg text-[var(--color-coral-text)]">{item.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Store" });
  return pageMetadata({ locale, path: "/store", title: t("title"), description: t("intro") });
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Store");

  return (
    <>
      <PageHero title={t("title")} subtitle={t("intro")} />
      <div className="mx-auto max-w-5xl px-6 py-12 2xl:max-w-6xl">
        <section>
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("materialsHeading")}</h2>
          <p className="mt-2 max-w-[65ch] text-sm text-[var(--color-muted)]">{t("materialsIntro")}</p>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {christianEducationMaterials.map((item) => (
              <li
                key={item.name}
                className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]"
              >
                <p className="font-semibold text-[var(--color-fg)]">{item.name}</p>
                <p className="mt-3 font-display text-lg text-[var(--color-coral-text)]">{item.price}</p>
              </li>
            ))}
          </ul>
          <a
            href="https://www.cacnachristianeducation.com/shop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("shopCta")}${t("opensInNewTab")}`}
            className="mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold text-white"
            style={{ background: "var(--gradient-cta)" }}
          >
            {t("shopCta")}
          </a>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("apparelHeading")}</h2>
          <p className="mt-2 max-w-[65ch] text-sm text-[var(--color-muted)]">{t("apparelIntro")}</p>

          <ApparelCategory label={t("conventionApparel")} items={conventionApparelDemo} demoLabel={t("demoLabel")} />
          <ApparelCategory label={t("goodWomenApparel")} items={goodWomenApparelDemo} demoLabel={t("demoLabel")} />
          <ApparelCategory label={t("youthApparel")} items={youthApparelDemo} demoLabel={t("demoLabel")} />
        </section>
      </div>
    </>
  );
}
