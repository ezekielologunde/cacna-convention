import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ScheduleView } from "../../components/schedule/ScheduleView";
import type { Audience } from "../../components/schedule/ScheduleDay";
import messages from "../../messages/en.json";

const DAYS = [
  {
    dayDate: "2026-07-13",
    sessions: [
      {
        id: "general-1",
        starts_at: "09:00:00",
        ends_at: "10:00:00",
        title: "Daily General Opening Session",
        minister_name: null,
        minister_title: null,
        audience: ["all"] as Audience[],
      },
      {
        id: "ministers-1",
        starts_at: "17:00:00",
        ends_at: "19:00:00",
        title: "Ministers Prayer Night",
        minister_name: "Prophet H. Oladeji",
        minister_title: null,
        audience: ["adult"] as Audience[],
      },
    ],
  },
  {
    dayDate: "2026-07-15",
    sessions: [
      {
        id: "breakout-1",
        starts_at: "11:45:00",
        ends_at: "13:15:00",
        title: "Break Out #1",
        minister_name: null,
        minister_title: null,
        audience: ["youth", "adult", "children"] as Audience[],
      },
    ],
  },
];

function renderView() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ScheduleView days={DAYS.map((d) => ({ ...d, sessions: [...d.sessions] }))} />
    </NextIntlClientProvider>
  );
}

describe("ScheduleView", () => {
  it("shows every session under the default All filter", () => {
    renderView();

    expect(screen.getByText("Daily General Opening Session")).toBeInTheDocument();
    expect(screen.getByText("Ministers Prayer Night")).toBeInTheDocument();
    expect(screen.getByText("Break Out #1")).toBeInTheDocument();
  });

  it("filtering to Children hides adult-only sessions but keeps general and breakout ones", () => {
    renderView();

    fireEvent.click(screen.getByRole("button", { name: "Children" }));

    expect(screen.getByText("Daily General Opening Session")).toBeInTheDocument();
    expect(screen.queryByText("Ministers Prayer Night")).not.toBeInTheDocument();
    expect(screen.getByText("Break Out #1")).toBeInTheDocument();
  });

  it("filtering to Adult hides nothing here -- both the ministers session and the breakout apply", () => {
    renderView();

    fireEvent.click(screen.getByRole("button", { name: "Adult" }));

    expect(screen.getByText("Daily General Opening Session")).toBeInTheDocument();
    expect(screen.getByText("Ministers Prayer Night")).toBeInTheDocument();
    expect(screen.getByText("Break Out #1")).toBeInTheDocument();
  });

  it("marks the active filter button with aria-pressed", () => {
    renderView();

    const allButton = screen.getByRole("button", { name: "All" });
    const youthButton = screen.getByRole("button", { name: "Youth" });
    expect(allButton).toHaveAttribute("aria-pressed", "true");
    expect(youthButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(youthButton);

    expect(allButton).toHaveAttribute("aria-pressed", "false");
    expect(youthButton).toHaveAttribute("aria-pressed", "true");
  });
});
