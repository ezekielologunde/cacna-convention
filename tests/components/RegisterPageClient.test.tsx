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

  it("switches to the Complimentary tab, submits with isComplimentary true, and redirects on success", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ checkoutUrl: "https://example.com/en/register/confirmation?registration=comp-1" }),
    });
    const originalLocation = window.location;
    // @ts-expect-error -- deleting so it can be replaced with a writable stub
    delete window.location;
    (window as unknown as { location: unknown }).location = { ...originalLocation, href: "" };

    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: "Complimentary" }));
    expect(screen.getByRole("tab", { name: "Complimentary" })).toHaveAttribute("aria-selected", "true");

    // Complimentary reuses the single-registrant Individual layout -- no
    // church name field, same fields fillMinimalIndividualForm already fills.
    fillMinimalIndividualForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit Complimentary Registration" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, requestInit] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(requestInit.body)).toEqual(
      expect.objectContaining({ isComplimentary: true, registrationType: "individual" })
    );
    await waitFor(() => expect(window.location.href).toBe(
      "https://example.com/en/register/confirmation?registration=comp-1"
    ));

    (window as unknown as { location: unknown }).location = originalLocation;
  });
});
