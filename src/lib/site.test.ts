import { describe, expect, it } from "vitest";
import { site } from "./site";

describe("site metadata", () => {
  it("uses the official project name and learning-platform tagline", () => {
    expect(site.name).toBe("Struktiva");
    expect(site.tagline).toBe("Interactive Data Structures Learning Platform");
  });
});
