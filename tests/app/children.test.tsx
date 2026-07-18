import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { createNextIntlServerMock } from "../helpers/next-intl-server-mock";
import { childrenSchedule, childrenTeachers } from "../../lib/content/children-convention";

// See tests/app/archive.test.tsx for why next-intl/server is mocked here.
vi.mock("next-intl/server", () => createNextIntlServerMock(messages));

describe("ChildrenPage", () => {
  it("renders the theme, coordinator, schedule, and teacher list", async () => {
    const { default: ChildrenPage } = await import("../../app/(site)/[locale]/children/page");
    const Page = await ChildrenPage({ params: Promise.resolve({ locale: "en" }) });

    render(<NextIntlClientProvider locale="en" messages={messages}>{Page}</NextIntlClientProvider>);

    expect(
      screen.getByRole("heading", { name: "Children's Convention Program" })
    ).toBeInTheDocument();
    expect(screen.getByText(/God's Message to Children/)).toBeInTheDocument();
    expect(screen.getByText(/Mark 10:14/)).toBeInTheDocument();
    expect(screen.getByText(/Evangelist Mrs. Oluwatoyin Oni/)).toBeInTheDocument();

    for (const day of childrenSchedule) {
      expect(screen.getByRole("heading", { name: day.dayLabel })).toBeInTheDocument();
    }

    for (const teacher of childrenTeachers) {
      expect(screen.getByText(teacher)).toBeInTheDocument();
    }
  });
});
