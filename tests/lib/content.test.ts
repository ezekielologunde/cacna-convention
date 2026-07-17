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

  it("committee has the 3 named roles", () => {
    expect(committee.map((c) => c.role)).toEqual(["Chairman", "Secretary", "PRO"]);
  });

  it("hotels covers all three cities", () => {
    const cities = new Set(hotels.map((h) => h.city));
    expect(cities).toEqual(new Set(["Chambersburg, PA", "Gettysburg, PA", "Hagerstown, MD"]));
  });

  it("rules is a non-empty list of strings", () => {
    expect(rules.length).toBeGreaterThan(0);
    rules.forEach((r) => expect(typeof r).toBe("string"));
  });

  it("history has founding year 1976", () => {
    expect(history.foundingYear).toBe(1976);
  });
});
