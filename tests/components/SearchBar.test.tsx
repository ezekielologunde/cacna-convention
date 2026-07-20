import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { SearchBar } from "../../components/navigation/SearchBar";
import messages from "../../messages/en.json";

function renderSearchBar() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SearchBar />
    </NextIntlClientProvider>
  );
}

describe("SearchBar", () => {
  it("is closed until the search button is clicked", () => {
    renderSearchBar();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();
  });

  it("shows matching results as the user types and links to the right page", () => {
    renderSearchBar();
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    const input = screen.getByPlaceholderText("Search the site…");
    fireEvent.change(input, { target: { value: "Schedule" } });

    expect(screen.getByRole("link", { name: /Schedule/ })).toHaveAttribute("href", "/en/schedule");
  });

  it("shows a no-results message for a query that matches nothing", () => {
    renderSearchBar();
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    fireEvent.change(screen.getByPlaceholderText("Search the site…"), {
      target: { value: "zzzznonexistentzzzz" },
    });

    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("closes when the close button is clicked", () => {
    renderSearchBar();
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    renderSearchBar();
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
