import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

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
// stub. (Same pattern established in tests/app/plan-your-visit.test.tsx,
// tests/app/archive.test.tsx.)
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

describe("ContactPage", () => {
  it("renders the committee chairman's contact details", async () => {
    const { default: ContactPage } = await import("../../app/(site)/[locale]/contact/page");
    const Page = await ContactPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    // The page renders phone and email as sibling JSX expressions inside a
    // single <p> (`{contact.phone} · {contact.email}`), which become three
    // separate DOM text nodes under that one element. RTL's `getByText`
    // (default `exact: true`) compares against an element's *combined*
    // direct child text nodes, so no element's text equals the phone or the
    // email alone — confirmed by actually running this with `exact: true`
    // first, which threw "Unable to find an element with the text". Passing
    // `exact: false` does a substring match against that same combined text,
    // which resolves unambiguously since each substring appears in exactly
    // one place on the page.
    expect(
      screen.getByText("cacnaconvention@gmail.com", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText("301-440-7033", { exact: false })).toBeInTheDocument();
  });
});
