import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { christianEducation, christianEducationAgenda } from "../../lib/content/christian-education-program";

vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("ChristianEducationPage", () => {
  it("renders the title, theme, moderator, and full agenda table", async () => {
    const { default: ChristianEducationPage } = await import("../../app/(site)/[locale]/christian-education/page");
    const Page = await ChristianEducationPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: christianEducation.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(christianEducation.theme, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(christianEducation.themeVerse, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(christianEducation.date)).toBeInTheDocument();
    expect(screen.getByText(christianEducation.moderator, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Order of Program" })).toBeInTheDocument();

    for (const item of christianEducationAgenda) {
      expect(screen.getAllByText(item.time!).length).toBeGreaterThan(0);
      expect(screen.getAllByText(item.event).length).toBeGreaterThan(0);
      expect(screen.getAllByText(item.speaker!, { exact: false }).length).toBeGreaterThan(0);
    }
  });
});
