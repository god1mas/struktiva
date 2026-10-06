import { describe, expect, it } from "vitest";
import {
  getLessonCount,
  getLessonDefinition,
  getModuleDefinition,
  getOrderedLessons,
  getRegisteredModules,
} from "./index";

describe("learning content registry", () => {
  it("registers Linked List, Array, and Stack with deterministic lesson ordering", () => {
    expect(getRegisteredModules().map((module) => module.slug)).toEqual(["linked-list", "array", "stack"]);
    expect(getLessonCount("linked-list")).toBe(18);
    expect(getLessonCount("array")).toBe(12);
    expect(getLessonCount("stack")).toBe(11);
    expect(getOrderedLessons("linked-list").map((lesson) => lesson.order)).toEqual(
      Array.from({ length: 18 }, (_, index) => index + 1),
    );
    expect(getOrderedLessons("array").map((lesson) => lesson.order)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
    expect(getOrderedLessons("stack").map((lesson) => lesson.order)).toEqual(
      Array.from({ length: 11 }, (_, index) => index + 1),
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
    expect(getLessonDefinition("array", "contiguous-memory").order).toBe(3);
    expect(getLessonDefinition("stack", "top").order).toBe(3);
  });

  it("fails clearly for unknown modules and lessons", () => {
    expect(() => getModuleDefinition("tree")).toThrow("tidak terdaftar");
    expect(() => getLessonDefinition("linked-list", "missing")).toThrow(
      "tidak terdaftar",
    );
  });
});
