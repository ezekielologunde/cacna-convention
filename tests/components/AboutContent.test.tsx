import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";

// AboutContent calls `getTranslations` from `next-intl/server`, which needs
// a real Next.js RSC request context unavailable under Vitest — same
// module-resolution limitation and same mock pattern already established
// in tests/app/home.test.tsx et al.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

const { AboutContent } = await import("../../components/about/AboutContent");
const { leadership } = await import("../../lib/content/leadership");
const { committee } = await import("../../lib/content/committee");
const { history } = await import("../../lib/content/history");
const { aboutConvention } = await import("../../lib/content/about-convention");
const { externalResources } = await import("../../lib/content/external-resources");

describe("AboutContent", () => {
  it("renders every section's real content", async () => {
    // AboutContent is an async server component -- resolve it to a plain
    // element first, same pattern Next.js itself uses before handing the
    // tree to the client renderer.
    const element = await AboutContent({
      locale: "en",
      leadership,
      committee,
      aboutConvention,
      history,
    });

    render(<NextIntlClientProvider locale="en" messages={messages}>{element}</NextIntlClientProvider>);

    // Foundation
    expect(screen.getByText(aboutConvention.missionStatement)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Biblically Based" })).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.biblicallyBased[0])).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kingdom Focused" })).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.kingdomFocused[0])).toBeInTheDocument();

    // The Family
    expect(screen.getByRole("heading", { name: "More than an event. It's family." })).toBeInTheDocument();

    // Heritage
    expect(screen.getByText(history.summary)).toBeInTheDocument();
    expect(screen.getByText(String(history.foundingYear))).toBeInTheDocument();
    expect(screen.getByText(String(leadership.length))).toBeInTheDocument();
    expect(screen.getByText(String(committee.length))).toBeInTheDocument();

    // Leadership + Committee
    expect(screen.getByText(leadership[0].name)).toBeInTheDocument();
    expect(screen.getByText(committee[0].name)).toBeInTheDocument();

    // Superintendents trim + link-out (unchanged from the prior tab UI)
    expect(
      screen.getByRole("link", { name: /Find your Zone/i })
    ).toHaveAttribute("href", "https://cacnorthamerica.com/zones");
    expect(
      screen.getByRole("link", { name: /Find your DCC/i })
    ).toHaveAttribute("href", "https://cacnorthamerica.com/dccs");

    // Explore further — internal + every external resource. Each card's
    // accessible name is title + description concatenated (both sit inside
    // the same <a>), so match on the leading title text, same as the
    // external-resource links below.
    expect(screen.getByRole("link", { name: /^Full Schedule/ })).toHaveAttribute("href", "/en/schedule");
    expect(screen.getByRole("link", { name: /^Register/ })).toHaveAttribute("href", "/en/register");
    for (const resource of externalResources) {
      expect(
        screen.getByRole("link", { name: new RegExp(`^${resource.label}`) })
      ).toHaveAttribute("href", resource.url);
    }
  });
});
