import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AboutTabs } from "../../components/about/AboutTabs";
import messages from "../../messages/en.json";
import { leadership } from "../../lib/content/leadership";
import { committee } from "../../lib/content/committee";
import { superintendents } from "../../lib/content/superintendents";
import { history } from "../../lib/content/history";
import { aboutConvention } from "../../lib/content/about-convention";
import { externalResources } from "../../lib/content/external-resources";

describe("AboutTabs", () => {
  it("shows Our Story by default and switches tabs on click", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AboutTabs
          leadership={leadership}
          committee={committee}
          superintendents={superintendents}
          aboutConvention={aboutConvention}
          history={history}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(history.founder, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(history.fitaHqNote)).toBeInTheDocument();
    expect(screen.getByText(history.governanceNote)).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.missionStatement)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Biblically Based" })).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.biblicallyBased[0])).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kingdom Focused" })).toBeInTheDocument();
    expect(screen.getByText(aboutConvention.kingdomFocused[0])).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "External Resources" })).toBeInTheDocument();
    // Regex, not a plain string: getByRole's `name` option ignores `exact`
    // for string matchers (always exact-equality) -- only RegExp/function
    // matchers do a partial match. Each link's accessible name also
    // includes an "(opens in a new tab)" suffix via aria-label for screen
    // reader users.
    for (const resource of externalResources) {
      expect(
        screen.getByRole("link", { name: new RegExp(`^${resource.label}`) })
      ).toHaveAttribute("href", resource.url);
    }

    fireEvent.click(screen.getByRole("tab", { name: "Leadership" }));
    expect(screen.getByText(leadership[0].name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Committee" }));
    expect(screen.getByText(committee[0].name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Superintendents" }));
    expect(screen.getByText(superintendents[0].name)).toBeInTheDocument();
    expect(screen.getAllByText(superintendents[0].name)).toHaveLength(1);
  });
});
