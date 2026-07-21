import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import { NewsletterForm } from "../../components/navigation/NewsletterForm";

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <NewsletterForm />
    </NextIntlClientProvider>
  );
}

describe("NewsletterForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("submits the email and shows the success message", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success" }),
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText("Your email address"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => {
      expect(screen.getByText("You're subscribed — thank you!")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/newsletter",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows the already-subscribed message when the API reports a duplicate", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ status: "already_subscribed" }),
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText("Your email address"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => {
      expect(screen.getByText("You're already on the list — thank you!")).toBeInTheDocument();
    });
  });

  it("shows an error message when the request fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "A valid email address is required" }),
    });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText("Your email address"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    });
  });

  it("includes a honeypot field that is present but not visible", () => {
    renderForm();
    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});
