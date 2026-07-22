import { describe, it, expect } from "vitest";
import { renderQrCodeSvg } from "../../lib/qr";

describe("renderQrCodeSvg", () => {
  it("renders an inline SVG string encoding the given data", async () => {
    const svg = await renderQrCodeSvg("https://cacna-convention.vercel.app/register/confirmation?registration=abc123");

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("produces different output for different input data", async () => {
    const svgA = await renderQrCodeSvg("https://example.com/a");
    const svgB = await renderQrCodeSvg("https://example.com/b");

    expect(svgA).not.toEqual(svgB);
  });
});
