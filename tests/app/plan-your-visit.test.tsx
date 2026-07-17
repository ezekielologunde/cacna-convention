import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { hotels } from "../../lib/content/hotels";
import { rules } from "../../lib/content/rules";

// `next-intl/server`'s real (react-server) implementation of
// `getTranslations`/`setRequestLocale` needs an actual Next.js RSC request
// context (it reaches for `next/headers` under the hood). Outside of that —
// e.g. here, where the test imports the page module directly and calls it
// as a plain function — package resolution falls back to next-intl's
// non-RSC stub build, which throws `"... is not supported in Client
// Components."` for every export. That's a Vitest/Node module-resolution
// limitation, not a bug in the page: Next.js itself resolves the real
// react-server build at build/runtime. Mock the module here so the page's
// translation calls resolve against the real `en.json` copy instead of the
// stub.
vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async (namespace: string) => {
    const strings = (messages as Record<string, Record<string, string>>)[namespace];
    return (key: string, values?: Record<string, string | number>) => {
      let value = strings[key];
      if (values) {
        for (const [placeholder, replacement] of Object.entries(values)) {
          value = value.replace(`{${placeholder}}`, String(replacement));
        }
      }
      return value;
    };
  },
}));

describe("PlanYourVisitPage", () => {
  it("renders hotel names and rules", async () => {
    const { default: PlanYourVisitPage } = await import(
      "../../app/(site)/[locale]/plan-your-visit/page"
    );
    const Page = await PlanYourVisitPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText(hotels[0].name)).toBeInTheDocument();
    expect(screen.getByText(rules[0])).toBeInTheDocument();
  });
});
