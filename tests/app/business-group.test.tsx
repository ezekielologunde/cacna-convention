import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import {
  businessGroupFellowship,
  businessGroupAgenda,
  businessGroupExecutives,
  kingdomEconomicsMessage,
} from "../../lib/content/business-group-program";

vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("BusinessGroupPage", () => {
  it("renders the title, date, moderators, agenda table, executive roster, and Kingdom Economics message", async () => {
    const { default: BusinessGroupPage } = await import("../../app/(site)/[locale]/business-group/page");
    const Page = await BusinessGroupPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: businessGroupFellowship.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(businessGroupFellowship.date)).toBeInTheDocument();
    for (const moderator of businessGroupFellowship.moderators) {
      expect(screen.getByText(moderator, { exact: false })).toBeInTheDocument();
    }

    expect(screen.getByRole("heading", { name: "Order of Program" })).toBeInTheDocument();
    for (const item of businessGroupAgenda) {
      expect(screen.getAllByText(item.time!).length).toBeGreaterThan(0);
      expect(screen.getAllByText(item.event).length).toBeGreaterThan(0);
      expect(screen.getAllByText(item.speaker!, { exact: false }).length).toBeGreaterThan(0);
    }

    expect(screen.getByRole("heading", { name: "Executive Officers" })).toBeInTheDocument();
    for (const member of businessGroupExecutives) {
      expect(screen.getAllByText(member.name).length).toBeGreaterThan(0);
      if (member.role) {
        expect(screen.getAllByText(member.role, { exact: false }).length).toBeGreaterThan(0);
      }
    }

    expect(screen.getByRole("heading", { name: kingdomEconomicsMessage.title })).toBeInTheDocument();
    expect(screen.getAllByText(kingdomEconomicsMessage.verse!, { exact: false }).length).toBeGreaterThan(0);
    for (const contributor of kingdomEconomicsMessage.contributors) {
      expect(screen.getAllByText(contributor.name, { exact: false }).length).toBeGreaterThan(0);
    }
    for (const paragraph of kingdomEconomicsMessage.body) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });
});
