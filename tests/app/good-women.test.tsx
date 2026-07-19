import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { goodWomenConference, goodWomenExecutives, goodWomenSchedule } from "../../lib/content/good-women-conference";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("GoodWomenPage", () => {
  it("renders the title, leader, executive committee, and full schedule", async () => {
    const { default: GoodWomenPage } = await import("../../app/(site)/[locale]/good-women/page");
    const Page = await GoodWomenPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Good Women Association Conference" })).toBeInTheDocument();
    // leaderTitle ("CACNAGWA Leader") is textually identical to the leaderLabel
    // chrome text, so assert on the full combined string rather than leaderTitle alone.
    expect(
      screen.getByText(`${goodWomenConference.leader} — ${goodWomenConference.leaderTitle}`, { exact: false })
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Executive Committee" })).toBeInTheDocument();
    for (const member of goodWomenExecutives) {
      expect(screen.getAllByText(member.name).length).toBeGreaterThan(0);
      if (member.role) {
        expect(screen.getAllByText(member.role, { exact: false }).length).toBeGreaterThan(0);
      }
    }

    for (const session of goodWomenSchedule) {
      expect(screen.getByRole("heading", { name: `${session.dayLabel} · ${session.timeRange}` })).toBeInTheDocument();
      for (const item of session.agenda) {
        expect(screen.getAllByText(item.event).length).toBeGreaterThan(0);
        if (item.time) expect(screen.getAllByText(item.time).length).toBeGreaterThan(0);
        if (item.speaker) expect(screen.getAllByText(item.speaker, { exact: false }).length).toBeGreaterThan(0);
      }
    }
  });
});
