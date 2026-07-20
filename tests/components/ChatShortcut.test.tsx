import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ChatShortcut } from "../../components/ui/ChatShortcut";
import messages from "../../messages/en.json";

describe("ChatShortcut", () => {
  it("links to the Contact page with an accessible label", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ChatShortcut />
      </NextIntlClientProvider>
    );

    const link = screen.getByRole("link", { name: "Chat with us" });
    expect(link).toHaveAttribute("href", "/en/contact");
  });
});
