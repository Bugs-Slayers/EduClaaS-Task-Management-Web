import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn (className utility)", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false, null, undefined, "")).toBe("foo");
  });

  it("handles conditional classes via object syntax", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });

  it("handles conditional classes via array syntax", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    // tailwind-merge resolves conflicts: p-4 overrides p-2
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("merges text color conflicts correctly", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles mixed conditional and static classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", { active: isActive, disabled: isDisabled })).toBe(
      "base active",
    );
  });

  it("handles nested arrays", () => {
    expect(cn(["a", ["b", "c"]])).toBe("a b c");
  });
});
