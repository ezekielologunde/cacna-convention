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
const { statementOfFaith } = await import("../../lib/content/statement-of-faith");
const { welcomeMessage } = await import("../../lib/content/welcome");

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

    // Welcome -- moved here from the old homepage hero (now the Register
    // flow): the verbatim welcome message, the founding/leaders/committee
    // stat trio, and the week's rhythm grid.
    expect(screen.getByRole("heading", { name: "One Fold, Gathered Once a Year" })).toBeInTheDocument();
    expect(screen.getByText(welcomeMessage.paragraphs[0])).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/en/contact");
    // CountUp animates its number over ~1.2s via requestAnimationFrame even
    // once the (stubbed) IntersectionObserver fires immediately -- findByText's
    // default 1s timeout isn't enough, and under full-suite contention (many
    // files' rAF timers competing for the same event loop) even 3s isn't
    // reliably enough, so this is raised further than the single-file case
    // needs (same fix as tests/app/home.test.tsx's identical stat-trio
    // assertion, similarly widened).
    const findOpts = { timeout: 8000 };
    expect(await screen.findByText(String(history.foundingYear), {}, findOpts)).toBeInTheDocument();
    expect(screen.getByText("Founded")).toBeInTheDocument();
    expect(await screen.findByText(String(leadership.length), {}, findOpts)).toBeInTheDocument();
    expect(screen.getByText("Regional Leaders")).toBeInTheDocument();
    expect(await screen.findByText(String(committee.length), {}, findOpts)).toBeInTheDocument();
    expect(screen.getByText("Committee Members")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prayer & Worship" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ministers' Sessions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Break-Outs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Revival Nights" })).toBeInTheDocument();

    // Foundation
    expect(screen.getByText(aboutConvention.introSentence)).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.missionStatement)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Biblically Based" })).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.biblicallyBased[0])).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kingdom Focused" })).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.kingdomFocused[0])).toBeInTheDocument();

    // Statement of Faith
    expect(screen.getByRole("heading", { name: "What We Believe" })).toBeInTheDocument();
    for (const item of statementOfFaith) {
      expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument();
      expect(screen.getByText(item.body)).toBeInTheDocument();
    }

    // The Family
    expect(screen.getByRole("heading", { name: "More than an event. It's family." })).toBeInTheDocument();

    // Heritage — the founded-year/leaders/committee stat trio was removed
    // from this section (it duplicated the homepage hero's identical
    // numbers directly above the real leadership/committee rosters this
    // page renders below); the founding year still appears in the
    // Heritage heading itself.
    expect(screen.getByText(history.summary)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: new RegExp(String(history.foundingYear)) })
    ).toBeInTheDocument();

    // Leadership + Committee
    expect(screen.getByText(leadership[0].name)).toBeInTheDocument();
    expect(screen.getByText(committee[0].name)).toBeInTheDocument();

    // Leadership bios (Agbeja + Oluwatimilehin only, per the scope decision
    // to enrich existing Leadership members rather than duplicate the
    // full superintendent directory)
    for (const member of leadership) {
      if (member.bio) {
        expect(screen.getByText(member.bio)).toBeInTheDocument();
      }
    }

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
    expect(screen.getByRole("link", { name: /^Register/ })).toHaveAttribute("href", "/en");
    for (const resource of externalResources) {
      expect(
        screen.getByRole("link", { name: new RegExp(`^${resource.label}`) })
      ).toHaveAttribute("href", resource.url);
    }
  }, 30000);
});
