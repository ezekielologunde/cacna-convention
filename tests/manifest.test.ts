import { describe, it, expect } from "vitest";
import manifest from "../app/manifest";

describe("PWA manifest", () => {
  it("declares a standalone, installable app", () => {
    const result = manifest();
    expect(result.display).toBe("standalone");
    expect(result.name).toBe("CACNA Convention");
    expect(result.icons?.length).toBeGreaterThan(0);
  });
});
