import { describe, it, expect } from "vitest";
import en from "../../messages/en.json";
import yo from "../../messages/yo.json";

function keys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return keys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe("translation message parity", () => {
  it("has exactly the same keys in en.json and yo.json", () => {
    expect(keys(yo).sort()).toEqual(keys(en).sort());
  });
});
