import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TurnstileWidget } from "../../components/ui/TurnstileWidget";

let capturedOnReady: (() => void) | undefined;
vi.mock("next/script", () => ({
  default: (props: { onReady?: () => void }) => {
    capturedOnReady = props.onReady;
    return null;
  },
}));

const renderMock = vi.fn(() => "widget-id-1");
const removeMock = vi.fn();

beforeEach(() => {
  capturedOnReady = undefined;
  renderMock.mockClear();
  removeMock.mockClear();
  window.turnstile = { render: renderMock, remove: removeMock };
});

describe("TurnstileWidget", () => {
  it("renders the widget once the script is ready, wired to the site key and onVerify callback", () => {
    const onVerify = vi.fn();
    render(<TurnstileWidget onVerify={onVerify} />);

    capturedOnReady?.();

    expect(renderMock).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({ sitekey: "0x4AAAAAAD6IPZ3zubhtWUZf", callback: onVerify })
    );
  });

  it("does not render a second widget if onReady fires again", () => {
    render(<TurnstileWidget onVerify={vi.fn()} />);

    capturedOnReady?.();
    capturedOnReady?.();

    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  it("removes the widget on unmount", () => {
    const { unmount } = render(<TurnstileWidget onVerify={vi.fn()} />);
    capturedOnReady?.();

    unmount();

    expect(removeMock).toHaveBeenCalledWith("widget-id-1");
  });
});
