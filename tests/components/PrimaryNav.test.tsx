import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { PrimaryNav } from "../../components/navigation/PrimaryNav";
import messages from "../../messages/en.json";

function renderNav() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PrimaryNav />
    </NextIntlClientProvider>
  );
}

describe("PrimaryNav", () => {
  it("renders the five primary nav items", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Schedule" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Live" })).toBeInTheDocument();
  });

  it("renders a dominant Register Now CTA and a secondary Give button", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Register Now" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Give" })).toBeInTheDocument();
  });
});
