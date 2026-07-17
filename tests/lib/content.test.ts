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
    // Leadership table — a wrong name/title here should fail this test.
    expect(leadership[0]).toEqual({
      name: "Pastor Timothy Agbeja, Ph.D.",
      title:
        "Latunde Regional Superintendent, CACNA Chairman, CACNA Coordinating Council Chancellor, CACNA Bible Institute Superintendent, Washington DCC",
    });
    expect(leadership[leadership.length - 1]).toEqual({
      name: "Pastor John Oluwatimilehin, Ph.D.",
      title:
        "Chairman, CAC Village Management Council Member, CACNA Coordinating Council Superintendent, Bethel DCC",
    });
  });

  it("committee has the 3 named roles", () => {
    expect(committee.map((c) => c.role)).toEqual(["Chairman", "Secretary", "PRO"]);
  });

  it("committee entries match the transcribed source exactly (name, organization, phone)", () => {
    // Values transcribed from the doc's Convention Committee table. Note
    // "C.A.C Vineyard of Comfort" has no trailing period (matches the Committee
    // page, unlike the Contacts page's "C.A.C." spelling) — this is intentional,
    // not a typo to "fix".
    expect(committee).toEqual([
      {
        role: "Chairman",
        name: "David Adenodi",
        organization: "C.A.C Vineyard of Comfort",
        phone: "301-440-7033",
      },
      {
        role: "Secretary",
        name: "Pastor Timothy Famojuro",
        organization: "C.A.C. FITA, Brooklyn, NY",
        phone: "917-709-1892",
      },
      {
        role: "PRO",
        name: "Pastor Yomi Ademuwagun",
        organization: "CAC Agape Fellowship MD",
        phone: "443-583-9416",
      },
    ]);
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

  it("rules is a non-empty list of strings", () => {
    expect(rules.length).toBeGreaterThan(0);
    rules.forEach((r) => expect(typeof r).toBe("string"));
  });

  it("rules include the specific known ID-tag and 1 Cor. 14:40 rules verbatim", () => {
    // Guards against paraphrased/rewritten rule text slipping in undetected.
    expect(rules).toContain(
      "Identification (ID tags) must be worn at all times and is required for convention hall entry."
    );
    expect(rules).toContain("Let all things be done decently and in order (1 Cor. 14:40).");
  });

  it("history has founding year 1976", () => {
    expect(history.foundingYear).toBe(1976);
  });
});
