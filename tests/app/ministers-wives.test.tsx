import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { ministersWivesConference, ministersWivesSchedule } from "../../lib/content/ministers-wives-conference";

vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("MinistersWivesPage", () => {
  it("renders the title, executive roster cards, and full schedule", async () => {
    const { default: MinistersWivesPage } = await import("../../app/(site)/[locale]/ministers-wives/page");
    const Page = await MinistersWivesPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "Ministers' Wives Conference" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Executive Members" })).toBeInTheDocument();

    for (const member of ministersWivesConference.executiveMembers) {
      expect(screen.getByText(member.name)).toBeInTheDocument();
      if (member.role) expect(screen.getByText(member.role)).toBeInTheDocument();
    }

    for (const session of ministersWivesSchedule) {
      expect(screen.getByRole("heading", { name: `${session.dayLabel} · ${session.timeRange}` })).toBeInTheDocument();
      for (const item of session.agenda) {
        expect(screen.getAllByText(item.time!).length).toBeGreaterThan(0);
        expect(screen.getAllByText(item.event).length).toBeGreaterThan(0);
        expect(screen.getAllByText(item.speaker!).length).toBeGreaterThan(0);
      }
    }
  });
});
