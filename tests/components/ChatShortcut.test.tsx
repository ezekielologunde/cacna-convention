import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ChatShortcut } from "../../components/ui/ChatShortcut";
import messages from "../../messages/en.json";

function renderShortcut() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ChatShortcut />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "success" }) }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ChatShortcut", () => {
  it("is closed by default, and opens the message form on click", () => {
    renderShortcut();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chat with us" }));

    expect(screen.getByRole("dialog", { name: "Chat with us" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    renderShortcut();
    const trigger = screen.getByRole("button", { name: "Chat with us" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("submits the message to POST /api/support and shows a success message", async () => {
    renderShortcut();
    fireEvent.click(screen.getByRole("button", { name: "Chat with us" }));

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Question about check-in" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "What time does check-in open?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/support", expect.objectContaining({ method: "POST" })));
    const body = JSON.parse((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body).toMatchObject({
      email: "person@example.com",
      subject: "Question about check-in",
      message: "What time does check-in open?",
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Thanks — we've got your message and will reply by email."
    );
  });

  it("shows an error message when the request fails, without claiming success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "boom" }) }));
    renderShortcut();
    fireEvent.click(screen.getByRole("button", { name: "Chat with us" }));

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Subject" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Message" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong sending your message. Please try again."
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
