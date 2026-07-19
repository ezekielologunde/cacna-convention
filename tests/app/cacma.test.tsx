import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { cacmaSchedule } from "../../lib/content/cacma-program";

vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("CacmaPage", () => {
  it("renders the title and full schedule", async () => {
    const { default: CacmaPage } = await import("../../app/(site)/[locale]/cacma/page");
    const Page = await CacmaPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(screen.getByRole("heading", { name: "CAC Latunde Region Men Association (CACMA)" })).toBeInTheDocument();

    for (const session of cacmaSchedule) {
      expect(screen.getByRole("heading", { name: `${session.dayLabel} · ${session.timeRange}` })).toBeInTheDocument();
      for (const item of session.agenda) {
        expect(screen.getAllByText(item.time!).length).toBeGreaterThan(0);
        expect(screen.getAllByText(item.event).length).toBeGreaterThan(0);
        if (item.speaker) expect(screen.getAllByText(item.speaker, { exact: false }).length).toBeGreaterThan(0);
      }
    }
  });
});
