import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ScheduleDay } from "../../components/schedule/ScheduleDay";
import messages from "../../messages/en.json";

describe("ScheduleDay", () => {
  it("renders a session with a named minister", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ScheduleDay
          dayDate="2026-07-14"
          sessions={[
            {
              id: "s1",
              starts_at: "10:00:00",
              ends_at: "11:30:00",
              title: "Ministers' Session 1",
              minister_name: "Pastor T. A. O. Agbeja",
              minister_title: "Regional Supt. Latunde Region",
            },
          ]}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Ministers' Session 1")).toBeInTheDocument();
    expect(screen.getByText("Pastor T. A. O. Agbeja")).toBeInTheDocument();
  });

  it("shows the Guest Minister placeholder when no minister is set", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ScheduleDay
          dayDate="2026-07-13"
          sessions={[
            {
              id: "s2",
              starts_at: "09:00:00",
              ends_at: "10:00:00",
              title: "Opening Session",
              minister_name: null,
              minister_title: null,
            },
          ]}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Guest Minister")).toBeInTheDocument();
  });
});
