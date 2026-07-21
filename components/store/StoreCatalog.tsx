"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { StoreProduct } from "@/lib/store";
import { RequiredMark } from "@/components/ui/RequiredMark";

type CartLine = {
  productId: string;
  name: string;
  unitPriceCents: number;
  size: string | null;
  quantity: number;
};

function lineKey(productId: string, size: string | null) {
  return `${productId}::${size ?? ""}`;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function ProductRow({
  product,
  addLabel,
  sizeLabel,
  onAdd,
}: {
  product: StoreProduct;
  addLabel: string;
  sizeLabel: string;
  onAdd: (size: string | null, quantity: number) => void;
}) {
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);

  return (
    <li className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
      <div>
        <p className="font-semibold text-[var(--color-fg)]">{product.name}</p>
        <p className="mt-1 font-display text-lg text-[var(--color-red-text)]">
          {formatPrice(product.price_cents)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {product.sizes.length > 0 && (
          <label className="sr-only" htmlFor={`size-${product.id}`}>
            {sizeLabel}
          </label>
        )}
        {product.sizes.length > 0 && (
          <select
            id={`size-${product.id}`}
            value={size ?? ""}
            onChange={(e) => setSize(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-fg)]"
          >
            {product.sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="min-h-11 w-20 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-fg)]"
          aria-label={`${product.name} quantity`}
        />
        <button
          type="button"
          onClick={() => onAdd(size, quantity)}
          className="min-h-11 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-red-text)] hover:text-[var(--color-red-text)]"
        >
          {addLabel}
        </button>
      </div>
    </li>
  );
}

export function StoreCatalog({
  categories,
  labels,
}: {
  categories: { key: string; label: string; products: StoreProduct[] }[];
  labels: {
    addCta: string;
    sizeLabel: string;
    cartHeading: string;
    emptyCart: string;
    emptyCartHint: string;
    removeCta: string;
    totalLabel: string;
    nameLabel: string;
    emailLabel: string;
    checkoutCta: string;
    checkingOutCta: string;
    errorMessage: string;
  };
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0),
    [cart]
  );

  function addToCart(product: StoreProduct, size: string | null, quantity: number) {
    setCart((current) => {
      const key = lineKey(product.id, size);
      const existing = current.find((line) => lineKey(line.productId, line.size) === key);
      if (existing) {
        return current.map((line) =>
          lineKey(line.productId, line.size) === key
            ? { ...line, quantity: line.quantity + quantity }
            : line
        );
      }
      return [
        ...current,
        { productId: product.id, name: product.name, unitPriceCents: product.price_cents, size, quantity },
      ];
    });
  }

  function removeLine(key: string) {
    setCart((current) => current.filter((line) => lineKey(line.productId, line.size) !== key));
  }

  async function handleCheckout(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorText(null);
    try {
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName,
          contactEmail,
          items: cart.map((line) => ({ productId: line.productId, size: line.size, quantity: line.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) {
        // Surface the server's specific reason (e.g. an item going
        // inactive between page load and checkout) instead of always
        // showing the same generic message regardless of cause.
        setErrorText(typeof data?.error === "string" ? data.error : null);
        setStatus("error");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setErrorText(null);
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {categories.map((category) => (
        <div key={category.key}>
          <h3 className="font-display text-base text-[var(--color-fg)]">{category.label}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {category.products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                addLabel={labels.addCta}
                sizeLabel={labels.sizeLabel}
                onAdd={(size, quantity) => addToCart(product, size, quantity)}
              />
            ))}
          </ul>
        </div>
      ))}

      <div className="rounded-2xl border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-base text-[var(--color-fg)]">{labels.cartHeading}</h3>
        {cart.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            {labels.emptyCart} {labels.emptyCartHint}
          </p>
        ) : (
          <>
            <ul className="mt-4 flex flex-col gap-2">
              {cart.map((line) => {
                const key = lineKey(line.productId, line.size);
                return (
                  <li key={key} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-sm">
                    <span className="text-[var(--color-fg)]">
                      {line.name}
                      {line.size ? ` — ${line.size}` : ""} × {line.quantity}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-muted)]">
                        {formatPrice(line.unitPriceCents * line.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLine(key)}
                        className="font-semibold text-[var(--color-red-text)] underline"
                      >
                        {labels.removeCta}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
              <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                {labels.totalLabel}
              </span>
              <span className="font-display text-xl text-[var(--color-fg)]">{formatPrice(total)}</span>
            </div>

            <form onSubmit={handleCheckout} className="mt-6 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
                <span>
                  {labels.nameLabel}
                  <RequiredMark />
                </span>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  autoComplete="name"
                  className="rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
                <span>
                  {labels.emailLabel}
                  <RequiredMark />
                </span>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red-text)]"
                />
              </label>
              {status === "error" && (
                <p role="alert" className="text-sm font-semibold text-[var(--color-red-text)]">
                  {errorText ?? labels.errorMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-2 rounded-full px-5 py-3 font-semibold text-white shadow-[var(--shadow-glow-red)] transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                style={{ background: "var(--gradient-cta)" }}
              >
                {status === "submitting" ? labels.checkingOutCta : labels.checkoutCta}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
