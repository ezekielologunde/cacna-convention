import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { youthProgram, youthSchedule } from "../../lib/content/youth-program";

vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("YouthPage", () => {
  it("renders the title, theme, coordinator, and full multi-day schedule", async () => {
    const { default: YouthPage } = await import("../../app/(site)/[locale]/youth/page");
    const Page = await YouthPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: youthProgram.title, level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(youthProgram.theme, { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText(youthProgram.regionalCoordinator)).toBeInTheDocument();

    for (const day of youthSchedule) {
      expect(screen.getByRole("heading", { name: day.dayLabel })).toBeInTheDocument();
      for (const item of day.agenda) {
        expect(screen.getAllByText(item.time!).length).toBeGreaterThan(0);
        expect(screen.getAllByText(item.event, { exact: false }).length).toBeGreaterThan(0);
      }
    }
  });
});
