import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../messages/en.json";
import yoMessages from "../../messages/yo.json";

const allMessages: Record<string, Record<string, Record<string, string>>> = {
  en: enMessages,
  yo: yoMessages,
};

// Tracks the locale most recently passed to `setRequestLocale`, mirroring
// how the real next-intl server APIs thread the active request locale from
// `setRequestLocale` through to `getTranslations`. This lets a single mock
// serve both the `en` and `yo` renders exercised below instead of being
// hardcoded to one messages file.
let mockActiveLocale = "en";

// `next-intl/server`'s real (react-server) implementation of
// `getTranslations`/`setRequestLocale` needs an actual Next.js RSC request
// context (it reaches for `next/headers` under the hood). Outside of that —
// e.g. here, where the test imports the page module directly and calls it
// as a plain function — package resolution falls back to next-intl's
// non-RSC stub build, which throws `"... is not supported in Client
// Components."` for every export. That's a Vitest/Node module-resolution
// limitation, not a bug in the page: Next.js itself resolves the real
// react-server build at build/runtime. Mock the module here so the page's
// translation calls resolve against the real messages files instead of the
// stub. (Same pattern established in tests/app/plan-your-visit.test.tsx,
// tests/app/archive.test.tsx.)
vi.mock("next-intl/server", () => ({
  setRequestLocale: (locale: string) => {
    mockActiveLocale = locale;
  },
  getTranslations: async (namespace: string) => {
    const strings = allMessages[mockActiveLocale][namespace];
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

    render(<NextIntlClientProvider locale="en" messages={enMessages}>{Page}</NextIntlClientProvider>);

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

  it("translates all three roles in English", async () => {
    const { default: ContactPage } = await import("../../app/(site)/[locale]/contact/page");
    const Page = await ContactPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={enMessages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByText("Convention Chairman", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Convention Secretary", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("General inquiries", { exact: false })).toBeInTheDocument();
  });

  // Regression test for the bilingual-parity bug: previously only
  // `generalInquiries` went through `t(...)` while "Convention Chairman" and
  // "Convention Secretary" were hardcoded English literals, so `/yo/contact`
  // silently rendered two of the three roles in English. All three contacts
  // now look up `t(contact.roleKey)`, so this asserts the Yoruba strings
  // actually appear for every role, not just the one that happened to work
  // before.
  it("translates all three roles in Yoruba", async () => {
    const { default: ContactPage } = await import("../../app/(site)/[locale]/contact/page");
    const Page = await ContactPage({ params: Promise.resolve({ locale: "yo" }) });

    render(<NextIntlClientProvider locale="yo" messages={yoMessages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByText(yoMessages.Contact.chairman, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(yoMessages.Contact.secretary, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(yoMessages.Contact.generalInquiries, { exact: false })
    ).toBeInTheDocument();
  });
});
