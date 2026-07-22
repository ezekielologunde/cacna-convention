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
              audience: ["adult"],
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
              audience: ["all"],
            },
          ]}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Guest Minister")).toBeInTheDocument();
  });

  it("shows no age-group badge for a general (audience=all) session", () => {
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
              audience: ["all"],
            },
          ]}
        />
      </NextIntlClientProvider>
    );

    expect(screen.queryByText("Adult")).not.toBeInTheDocument();
    expect(screen.queryByText("Youth")).not.toBeInTheDocument();
    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });

  it("badges a single-audience session with its age group", () => {
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
              audience: ["adult"],
            },
          ]}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Adult")).toBeInTheDocument();
  });

  it("badges a multi-audience breakout session with every age group it covers", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ScheduleDay
          dayDate="2026-07-15"
          sessions={[
            {
              id: "s3",
              starts_at: "11:45:00",
              ends_at: "13:15:00",
              title: "Break Out #1",
              minister_name: null,
              minister_title: null,
              audience: ["youth", "adult", "children"],
            },
          ]}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Youth")).toBeInTheDocument();
    expect(screen.getByText("Adult")).toBeInTheDocument();
    expect(screen.getByText("Children")).toBeInTheDocument();
  });
});
