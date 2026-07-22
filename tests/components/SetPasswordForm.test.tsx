import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const updateUserMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createAttendeeClient: () => ({ auth: { updateUser: updateUserMock } }),
}));

const PROPS = {
  passwordLabel: "New password",
  confirmLabel: "Confirm password",
  saveCta: "Save",
  savingCta: "Saving…",
  successMessage: "Password set. You can now sign in with it too.",
  errorMessage: "Something went wrong. Please try again.",
  mismatchError: "Passwords don't match.",
  tooShortError: "Password must be at least 6 characters.",
};

beforeEach(() => {
  updateUserMock.mockReset();
  updateUserMock.mockResolvedValue({ error: null });
});

async function renderForm() {
  const { SetPasswordForm } = await import("../../components/ui/SetPasswordForm");
  return render(<SetPasswordForm {...PROPS} />);
}

describe("SetPasswordForm", () => {
  it("sets the password and shows a confirmation message on success", async () => {
    await renderForm();

    fireEvent.change(screen.getByLabelText(PROPS.passwordLabel), { target: { value: "hunter22" } });
    fireEvent.change(screen.getByLabelText(PROPS.confirmLabel), { target: { value: "hunter22" } });
    fireEvent.click(screen.getByRole("button", { name: PROPS.saveCta }));

    await waitFor(() => expect(updateUserMock).toHaveBeenCalledWith({ password: "hunter22" }));
    expect(await screen.findByRole("status")).toHaveTextContent(PROPS.successMessage);
  });

  it("rejects a too-short password without calling the API", async () => {
    await renderForm();

    fireEvent.change(screen.getByLabelText(PROPS.passwordLabel), { target: { value: "abc" } });
    fireEvent.change(screen.getByLabelText(PROPS.confirmLabel), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: PROPS.saveCta }));

    expect(await screen.findByRole("alert")).toHaveTextContent(PROPS.tooShortError);
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords without calling the API", async () => {
    await renderForm();

    fireEvent.change(screen.getByLabelText(PROPS.passwordLabel), { target: { value: "hunter22" } });
    fireEvent.change(screen.getByLabelText(PROPS.confirmLabel), { target: { value: "hunter23" } });
    fireEvent.click(screen.getByRole("button", { name: PROPS.saveCta }));

    expect(await screen.findByRole("alert")).toHaveTextContent(PROPS.mismatchError);
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("shows the API's error message when the update fails", async () => {
    updateUserMock.mockResolvedValue({ error: { message: "Session expired" } });
    await renderForm();

    fireEvent.change(screen.getByLabelText(PROPS.passwordLabel), { target: { value: "hunter22" } });
    fireEvent.change(screen.getByLabelText(PROPS.confirmLabel), { target: { value: "hunter22" } });
    fireEvent.click(screen.getByRole("button", { name: PROPS.saveCta }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Session expired");
  });
});
