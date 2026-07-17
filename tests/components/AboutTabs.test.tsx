import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AboutTabs } from "../../components/about/AboutTabs";
import messages from "../../messages/en.json";
import { leadership } from "../../lib/content/leadership";
import { committee } from "../../lib/content/committee";
import { history } from "../../lib/content/history";

describe("AboutTabs", () => {
  it("shows Our Story by default and switches to Leadership on click", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AboutTabs leadership={leadership} committee={committee} history={history} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(history.founder, { exact: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Leadership" }));
    expect(screen.getByText(leadership[0].name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Committee" }));
    expect(screen.getByText(committee[0].name)).toBeInTheDocument();
  });
});
