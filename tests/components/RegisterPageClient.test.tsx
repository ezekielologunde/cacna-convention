import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { RegisterPageClient } from "../../components/register/RegisterPageClient";
import messages from "../../messages/en.json";

function renderPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <RegisterPageClient />
    </NextIntlClientProvider>
  );
}

function fillMinimalIndividualForm() {
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Jane Doe" } });
  fireEvent.change(screen.getByLabelText("Contact name"), { target: { value: "Jane Doe" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
}

describe("RegisterPageClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    renderPage();
    fillMinimalIndividualForm();
    fireEvent.click(screen.getByRole("button", { name: "Continue to Payment" }));

    const submitting = await screen.findByRole("button", { name: "Submitting…" });
    expect(submitting).toBeDisabled();

    resolveFetch({ ok: true, json: async () => ({ checkoutUrl: "https://example.com" }) });
  });

  it("shows an inline error instead of a native alert when the request fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderPage();
    fillMinimalIndividualForm();
    fireEvent.click(screen.getByRole("button", { name: "Continue to Payment" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Registration failed. Please try again or contact us."
    );
    expect(screen.getByRole("button", { name: "Continue to Payment" })).not.toBeDisabled();
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
