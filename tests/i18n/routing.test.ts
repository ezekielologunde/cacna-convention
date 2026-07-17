import { describe, it, expect } from "vitest";
import { routing } from "../../i18n/routing";

describe("i18n routing config", () => {
  it("supports English and Yoruba with English as default", () => {
    expect(routing.locales).toEqual(["en", "yo"]);
    expect(routing.defaultLocale).toBe("en");
  });
});
