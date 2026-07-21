import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

let capturedOnVerify: ((token: string) => void) | undefined;
vi.mock("@/components/ui/TurnstileWidget", () => ({
  TurnstileWidget: ({ onVerify }: { onVerify: (token: string) => void }) => {
    capturedOnVerify = onVerify;
    return null;
  },
}));

const signInWithOtpMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createAttendeeClient: () => ({ auth: { signInWithOtp: signInWithOtpMock } }),
}));

async function renderLoginPage() {
  const { default: AccountLoginPage } = await import("../../app/(site)/[locale]/account/login/page");
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AccountLoginPage />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  capturedOnVerify = undefined;
  signInWithOtpMock.mockReset();
  signInWithOtpMock.mockResolvedValue({ error: null });
});

describe("AccountLoginPage", () => {
  it("disables submit until the captcha verifies", async () => {
    await renderLoginPage();
    expect(screen.getByRole("button", { name: "Send magic link" })).toBeDisabled();

    act(() => capturedOnVerify?.("captcha-token"));
    expect(screen.getByRole("button", { name: "Send magic link" })).not.toBeDisabled();
  });

  it("sends a magic link with the captcha token and shows the check-your-email state", async () => {
    await renderLoginPage();
    act(() => capturedOnVerify?.("captcha-token"));

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send magic link" }));

    await waitFor(() => expect(signInWithOtpMock).toHaveBeenCalled());
    expect(signInWithOtpMock).toHaveBeenCalledWith({
      email: "person@example.com",
      options: expect.objectContaining({ captchaToken: "captcha-token" }),
    });
    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeInTheDocument();
  });

  it("shows an error message when signInWithOtp fails, without silently claiming success", async () => {
    signInWithOtpMock.mockResolvedValue({ error: { message: "rate limited" } });
    await renderLoginPage();
    act(() => capturedOnVerify?.("captcha-token"));

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send magic link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong sending the link. Please try again."
    );
    expect(screen.queryByRole("heading", { name: "Check your email" })).not.toBeInTheDocument();
  });
});
