import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ConversionHero } from "@/components/ui/ConversionHero";
import { RegisterCta } from "@/components/register/RegisterCta";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import { christianEducationMaterials } from "@/lib/content/store-items";
import { getActiveStoreProducts, productsByCategory } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/metadata";

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

  const supabase = await createClient();
  const products = await getActiveStoreProducts(supabase);

  const categories = [
    { key: "convention", label: t("conventionApparel"), products: productsByCategory(products, "convention") },
    { key: "good_women", label: t("goodWomenApparel"), products: productsByCategory(products, "good_women") },
    { key: "youth", label: t("youthApparel"), products: productsByCategory(products, "youth") },
  ].filter((c) => c.products.length > 0);

  return (
    <>
      <ConversionHero
        photoSrc="/photos/gallery/IMG-20250719-WA0027.jpg"
        heading={t("title")}
        body={t("intro")}
        cta={{ label: t("shopHeroCta"), href: "#apparel-section" }}
      />
      <div className="mx-auto w-full max-w-5xl px-6 py-12 2xl:max-w-6xl">
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
                <p className="mt-3 font-display text-lg text-[var(--color-red-text)]">{item.price}</p>
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

        <section id="apparel-section" className="mt-14 scroll-mt-6">
          <h2 className="font-display text-xl text-[var(--color-fg)]">{t("apparelHeading")}</h2>
          <p className="mt-2 max-w-[65ch] text-sm text-[var(--color-muted)]">{t("apparelIntro")}</p>

          <div className="mt-6">
            <StoreCatalog
              categories={categories}
              labels={{
                addCta: t("addCta"),
                sizeLabel: t("sizeLabel"),
                cartHeading: t("cartHeading"),
                emptyCart: t("emptyCart"),
                emptyCartHint: t("emptyCartHint"),
                removeCta: t("removeCta"),
                totalLabel: t("totalLabel"),
                nameLabel: t("nameLabel"),
                emailLabel: t("emailLabel"),
                checkoutCta: t("checkoutCta"),
                checkingOutCta: t("checkingOutCta"),
                errorMessage: t("checkoutError"),
              }}
            />
          </div>
        </section>
      </div>
      <RegisterCta locale={locale} />
    </>
  );
}
