import { describe, expect, it } from "vitest";
import {
  getLessonCount,
  getLessonDefinition,
  getModuleDefinition,
  getOrderedLessons,
  getRegisteredModules,
} from "./index";

describe("learning content registry", () => {
  it("registers only the Linked List reference module with 18 ordered lessons", () => {
    expect(getRegisteredModules().map((module) => module.slug)).toEqual(["linked-list"]);
    expect(getLessonCount("linked-list")).toBe(18);
    expect(getOrderedLessons("linked-list").map((lesson) => lesson.order)).toEqual(
      Array.from({ length: 18 }, (_, index) => index + 1),
    );
  });

  it("uses unique stable module and lesson slugs", () => {
    const modules = getRegisteredModules();
    const moduleSlugs = modules.map((module) => module.slug);
    const lessonSlugs = modules.flatMap((module) =>
      module.lessons.map((lesson) => `${module.slug}/${lesson.slug}`),
    );

    expect(new Set(moduleSlugs).size).toBe(moduleSlugs.length);
    expect(new Set(lessonSlugs).size).toBe(lessonSlugs.length);
    expect(getLessonDefinition("linked-list", "pointer-and-next").order).toBe(3);
  });

  it("fails clearly for unknown modules and lessons", () => {
    expect(() => getModuleDefinition("tree")).toThrow("tidak terdaftar");
    expect(() => getLessonDefinition("linked-list", "missing")).toThrow(
      "tidak terdaftar",
    );
  });
});
