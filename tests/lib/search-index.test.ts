import { describe, it, expect } from "vitest";
import { searchSite } from "../../lib/search-index";

describe("searchSite", () => {
  it("returns an empty array for an empty query", () => {
    expect(searchSite("")).toEqual([]);
    expect(searchSite("   ")).toEqual([]);
  });

  it("matches page titles case-insensitively", () => {
    const results = searchSite("SCHEDULE");
    expect(results.some((r) => r.title === "Schedule" && r.href === "/schedule")).toBe(true);
  });

  it("matches real leadership/committee names sourced from the content modules", () => {
    // "Adenodi" matches multiple real people across categories (e.g.
    // Pastor David Adenodi appears in both leadership.ts and contacts.ts,
    // since he's both a regional leader and a listed contact) -- assert on
    // the match itself, not a single expected category/href. His name also
    // now appears in a news-events.ts excerpt (the Convention Chairman
    // transition announcement), which matches by excerpt rather than title.
    const results = searchSite("Adenodi");
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      const matchesTitle = result.title.toLowerCase().includes("adenodi");
      const matchesExcerpt = result.excerpt?.toLowerCase().includes("adenodi") ?? false;
      expect(matchesTitle || matchesExcerpt).toBe(true);
      expect(["/about", "/contact", "/news"]).toContain(result.href);
    }
    expect(results.some((r) => r.href === "/about")).toBe(true);
  });

  it("matches on excerpt text, not just title", () => {
    // "Chairperson" only appears in ministersWivesConference's executive
    // member excerpt, not in any title -- confirms excerpt-matching works.
    const results = searchSite("chairperson");
    expect(results.some((r) => r.excerpt?.toLowerCase().includes("chairperson"))).toBe(true);
  });

  it("ranks title matches above excerpt-only matches", () => {
    // "Contact" is a page title; it may also appear in some excerpt text.
    // The page entry should be first.
    const results = searchSite("Contact");
    expect(results[0]?.title).toBe("Contact");
  });

  it("respects the limit parameter", () => {
    const results = searchSite("a", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});
