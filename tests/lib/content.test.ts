import { describe, it, expect } from "vitest";
import { leadership } from "../../lib/content/leadership";
import { committee } from "../../lib/content/committee";
import { hotels } from "../../lib/content/hotels";
import { rules } from "../../lib/content/rules";
import { history } from "../../lib/content/history";

describe("static content data", () => {
  it("leadership has 5 named leaders", () => {
    expect(leadership).toHaveLength(5);
    expect(leadership[0]).toHaveProperty("name");
    expect(leadership[0]).toHaveProperty("title");
  });

  it("leadership's first and last entries match the transcribed source exactly", () => {
    // Values transcribed from docs/source-content/2026-cacnaconvention-org-content.md's
    // Leadership table — a wrong name/title here should fail this test. `photo`
    // is checked separately (non-empty path) rather than pinned to an exact
    // string, since it points at a scraped asset rather than transcribed text.
    expect(leadership[0]).toMatchObject({
      name: "Pastor Timothy Agbeja, Ph.D.",
      title:
        "Latunde Regional Superintendent, CACNA Chairman, CACNA Coordinating Council Chancellor, CACNA Bible Institute Superintendent, Washington DCC",
    });
    expect(leadership[leadership.length - 1]).toMatchObject({
      name: "Pastor John Oluwatimilehin, Ph.D.",
      title:
        "Chairman, CAC Village Management Council Member, CACNA Coordinating Council Superintendent, Bethel DCC",
    });
    leadership.forEach((member) => expect(member.photo).toMatch(/^\/photos\/people\/.+/));
  });

  it("committee has 30 members, starting with Chairman/Secretary/PRO", () => {
    // Transcribed from the 2026 Convention & Conference Committee Members
    // list. The first three carry the same roles as the earlier 3-person
    // list, under fuller name variants (e.g. "Pastor Yomi Ademuwagun" ->
    // "Pastor Abayomi Ademuwagun" is the same person, still PRO).
    expect(committee).toHaveLength(30);
    expect(committee[0]).toEqual({ name: "Pastor David O. Adenodi, Ph.D.", role: "Chairman" });
    expect(committee[1]).toEqual({ name: "Pastor Oluwagbemiga Famojuro, D.Min.", role: "Secretary" });
    expect(committee[2]).toEqual({ name: "Pastor Abayomi Ademuwagun", role: "PRO" });
  });

  it("committee members without a listed role have no role field", () => {
    // The source list didn't attach a role to every member -- these should
    // stay role-less rather than fall back to an invented placeholder.
    const noRole = committee.find((c) => c.name === "Ebunoluwa Oke");
    expect(noRole).toEqual({ name: "Ebunoluwa Oke" });
    expect(noRole).not.toHaveProperty("role");
  });

  it("hotels covers all three cities", () => {
    const cities = new Set(hotels.map((h) => h.city));
    expect(cities).toEqual(new Set(["Chambersburg, PA", "Gettysburg, PA", "Hagerstown, MD"]));
  });

  it("hotels have correct name, phone, and rate across different cities", () => {
    // Spot-check values transcribed from the doc's Hotel Lodging table, one
    // hotel per city, so a wrong phone number or rate would fail here.
    const bySlug = (name: string, city: string) =>
      hotels.find((h) => h.name === name && h.city === city);

    expect(bySlug("Comfort Inn Greencastle", "Chambersburg, PA")).toMatchObject({
      phone: "717-798-3578",
      ratePerNight: 139,
    });
    expect(bySlug("Super 8 By Wyndham I-81", "Chambersburg, PA")).toMatchObject({
      phone: "717-263-6655",
      ratePerNight: 75,
    });
    expect(bySlug("Hampton Inn", "Hagerstown, MD")).toMatchObject({
      phone: "240-420-1970",
      ratePerNight: 139,
    });
  });

  it("rules has remember, rules, and attribution sections", () => {
    expect(rules).toHaveProperty("remember");
    expect(rules).toHaveProperty("rules");
    expect(rules).toHaveProperty("attribution");
    expect(Array.isArray(rules.remember)).toBe(true);
    expect(Array.isArray(rules.rules)).toBe(true);
    expect(rules.remember.length).toBeGreaterThan(0);
    expect(rules.rules.length).toBeGreaterThan(0);
    expect(rules.attribution).toHaveProperty("name");
    expect(rules.attribution).toHaveProperty("title");
  });

  it("rules arrays contain only strings", () => {
    rules.remember.forEach((r) => expect(typeof r).toBe("string"));
    rules.rules.forEach((r) => expect(typeof r).toBe("string"));
    expect(typeof rules.attribution.name).toBe("string");
    expect(typeof rules.attribution.title).toBe("string");
  });

  it("rules include the specific known ID-tag and 1 Cor. 14:40 rules verbatim", () => {
    // Guards against paraphrased/rewritten rule text slipping in undetected.
    expect(rules.rules[0]).toBe(
      "Ensure that your identification tag is always on throughout the duration of the convention. You will not be allowed in the Convention Hall without your tag."
    );
    expect(rules.remember[0]).toContain("Let all things be done decently and in order");
    expect(rules.remember[0]).toContain("1 Cor. 14:40");
  });

  it("history has founding year 1976", () => {
    expect(history.foundingYear).toBe(1976);
  });
});
