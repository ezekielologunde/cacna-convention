// Sourced from cacnaconvention.org/payment-options/ (found 2026-07-20 via a
// fresh re-crawl -- not linked from any visible nav menu on the source site,
// only discoverable via its pages sitemap, but real, current content).

export type PaymentMethod = { name: string; detail: string; accent: string };

export const paymentOptions = {
  methods: [
    {
      name: "Zelle",
      detail: "Send to cacnaconvention@gmail.com.",
      // Zelle's own brand purple ("Purple Heart") -- not an invented color,
      // this is their actual identity, since Zelle itself (not CACNA) is
      // what's processing this payment method.
      accent: "#6D1ED4",
    },
    {
      name: "Check",
      detail: "Deposit directly to Chase Bank under \"CACNA CONVENTION,\" Account Number 823936908.",
      // No real brand color to borrow here -- Chase is just where it's
      // deposited, not a payment processor in its own right the way Zelle
      // or Stripe are, so this stays a neutral ink tone rather than
      // impersonating Chase's own blue.
      accent: "#3F3A45",
    },
    {
      name: "Credit / Debit Card",
      detail: "Pay by card during registration via Stripe. A 4% processing surcharge applies (a $100.00 fee becomes $104.00).",
      // Stripe's own brand color ("Cornflower Blue") -- this is the actual
      // processor behind the Continue to Payment button on this page.
      accent: "#635BFF",
    },
  ] satisfies PaymentMethod[],
};
