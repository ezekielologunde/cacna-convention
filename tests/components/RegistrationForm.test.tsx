import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { RegistrationForm } from "../../components/register/RegistrationForm";
import messages from "../../messages/en.json";

function renderForm(onSubmit = vi.fn()) {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <RegistrationForm mode="individual" onSubmit={onSubmit} />
    </NextIntlClientProvider>
  );
  return onSubmit;
}

describe("RegistrationForm (individual mode)", () => {
  it("submits one registrant with contact info", () => {
    const onSubmit = renderForm();

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "adult" } });
    fireEvent.change(screen.getByLabelText("Contact name"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to Payment" }));

    expect(onSubmit).toHaveBeenCalledWith({
      registrationType: "individual",
      churchName: null,
      contactName: "Jane Doe",
      contactEmail: "jane@example.com",
      contactPhone: "",
      registrants: [{ fullName: "Jane Doe", category: "adult" }],
    });
  });

  it("does not render a church-name field or add-registrant button in individual mode", () => {
    renderForm();
    expect(screen.queryByLabelText(/church/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add/i })).not.toBeInTheDocument();
  });
});

describe("RegistrationForm (group mode)", () => {
  it("renders a church-name field and lets you add/remove registrants", () => {
    const onSubmit = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <RegistrationForm mode="group" onSubmit={onSubmit} />
      </NextIntlClientProvider>
    );

    expect(screen.getByLabelText("Church name")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add another registrant" }));
    const nameInputs = screen.getAllByLabelText("Full name");
    expect(nameInputs).toHaveLength(2);

    fireEvent.change(nameInputs[0], { target: { value: "Jane Doe" } });
    fireEvent.change(nameInputs[1], { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText("Church name"), { target: { value: "CAC Test Assembly" } });
    fireEvent.change(screen.getByLabelText("Contact name"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to Payment" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationType: "group",
        churchName: "CAC Test Assembly",
        registrants: [
          { fullName: "Jane Doe", category: "adult" },
          { fullName: "John Doe", category: "adult" },
        ],
      })
    );
  });

  it("lets you remove a registrant", () => {
    const onSubmit = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <RegistrationForm mode="group" onSubmit={onSubmit} />
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add another registrant" }));
    expect(screen.getAllByLabelText("Full name")).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect(screen.getAllByLabelText("Full name")).toHaveLength(1);
  });
});
