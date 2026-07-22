import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const updateUserMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createAttendeeClient: () => ({ auth: { updateUser: updateUserMock } }),
}));

const PROPS = {
  newEmailLabel: "New email address",
  saveCta: "Save",
  savingCta: "Saving…",
  successMessage: "Check your new inbox to confirm the change.",
  errorMessage: "Something went wrong. Please try again.",
};

beforeEach(() => {
  updateUserMock.mockReset();
  updateUserMock.mockResolvedValue({ error: null });
});

async function renderForm() {
  const { ChangeEmailForm } = await import("../../components/ui/ChangeEmailForm");
  return render(<ChangeEmailForm {...PROPS} />);
}

describe("ChangeEmailForm", () => {
  it("submits the new email and shows a confirmation message on success", async () => {
    await renderForm();

    fireEvent.change(screen.getByLabelText(PROPS.newEmailLabel), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: PROPS.saveCta }));

    await waitFor(() => expect(updateUserMock).toHaveBeenCalledWith({ email: "new@example.com" }));
    expect(await screen.findByRole("status")).toHaveTextContent(PROPS.successMessage);
  });

  it("shows the API's error message when the update fails", async () => {
    updateUserMock.mockResolvedValue({ error: { message: "Email already in use" } });
    await renderForm();

    fireEvent.change(screen.getByLabelText(PROPS.newEmailLabel), {
      target: { value: "taken@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: PROPS.saveCta }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email already in use");
  });

  it("clears a prior error once the field is edited again", async () => {
    updateUserMock.mockResolvedValue({ error: { message: "Email already in use" } });
    await renderForm();

    fireEvent.change(screen.getByLabelText(PROPS.newEmailLabel), {
      target: { value: "taken@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: PROPS.saveCta }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(PROPS.newEmailLabel), {
      target: { value: "taken@example.com2" },
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
