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
const signInWithPasswordMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createAttendeeClient: () => ({
    auth: { signInWithOtp: signInWithOtpMock, signInWithPassword: signInWithPasswordMock },
  }),
}));

const routerPushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
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
  signInWithPasswordMock.mockReset();
  signInWithPasswordMock.mockResolvedValue({ error: null });
  routerPushMock.mockReset();
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

  describe("Password tab", () => {
    it("switches to the password form, revealing a password field", async () => {
      await renderLoginPage();

      expect(screen.queryByLabelText("Password", { selector: "input" })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("tab", { name: "Password" }));

      expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByLabelText("Password", { selector: "input" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    });

    it("signs in with email+password and redirects to Account on success", async () => {
      await renderLoginPage();
      fireEvent.click(screen.getByRole("tab", { name: "Password" }));
      act(() => capturedOnVerify?.("captcha-token"));

      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "person@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password", { selector: "input" }), {
        target: { value: "hunter2" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

      await waitFor(() => expect(signInWithPasswordMock).toHaveBeenCalled());
      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email: "person@example.com",
        password: "hunter2",
        options: expect.objectContaining({ captchaToken: "captcha-token" }),
      });
      expect(routerPushMock).toHaveBeenCalledWith("/en/account");
    });

    it("shows a password-specific error on failure, without redirecting", async () => {
      signInWithPasswordMock.mockResolvedValue({ error: { message: "Invalid login credentials" } });
      await renderLoginPage();
      fireEvent.click(screen.getByRole("tab", { name: "Password" }));
      act(() => capturedOnVerify?.("captcha-token"));

      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "person@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password", { selector: "input" }), {
        target: { value: "wrong" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Incorrect email or password. If you haven't set a password yet, use the email link instead."
      );
      expect(routerPushMock).not.toHaveBeenCalled();
    });
  });
});
