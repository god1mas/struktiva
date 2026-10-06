import { describe, expect, it } from "vitest";
import { getOrderedLessons } from "@/content";
import { deriveModuleLearningProgress } from "./derive-progress";

function derive(
  completedSlugs: readonly string[],
  options: {
    readonly moduleSlug?: string;
    readonly startedSlugs?: readonly string[];
    readonly scores?: readonly number[];
    readonly lastLessonSlug?: string | null;
  } = {},
) {
  return deriveModuleLearningProgress({
    moduleSlug: options.moduleSlug ?? "linked-list",
    lessonProgress: [
      ...completedSlugs.map((lessonSlug) => ({
        lessonSlug,
        completedAt: new Date("2026-01-01T00:00:00.000Z"),
      })),
      ...(options.startedSlugs ?? []).map((lessonSlug) => ({
        lessonSlug,
        completedAt: null,
      })),
    ],
    lastLessonSlug: options.lastLessonSlug ?? null,
    quizAttempts: (options.scores ?? []).map((score) => ({ score })),
  });
}

describe("progress derivation", () => {
  it("derives zero completion as not started", () => {
    const result = derive([]);
    expect(result.percentage).toBe(0);
    expect(result.status).toBe("not-started");
    expect(result.completedLessonCount).toBe(0);
  });

  it("derives partial completion without double-counting duplicates", () => {
    const result = derive(["node", "node", "head"]);
    expect(result.completedLessonCount).toBe(2);
    expect(result.percentage).toBe(11);
    expect(result.status).toBe("in-progress");
  });

  it("derives full completion as 100 percent", () => {
    const allLessons = getOrderedLessons("linked-list").map((lesson) => lesson.slug);
    const result = derive(allLessons);
    expect(result.completedLessonCount).toBe(18);
    expect(result.percentage).toBe(100);
    expect(result.status).toBe("completed");
  });

  it("counts only registered lesson IDs", () => {
    const result = derive(["node", "made-up-lesson"]);
    expect(result.completedLessonCount).toBe(1);
    expect(result.totalLessonCount).toBe(18);
  });

  it("treats a started lesson as in progress", () => {
    expect(derive([], { startedSlugs: ["node"] }).status).toBe("in-progress");
  });

  it("derives last lesson, best quiz score, and attempt count", () => {
    const result = derive(["node"], {
      scores: [60, 90, 80],
      lastLessonSlug: "pointer-and-next",
    });
    expect(result.lastLessonTitle).toBe("Pointer & Next");
    expect(result.bestQuizScore).toBe(90);
    expect(result.quizAttemptCount).toBe(3);
  });

  it("keeps Array progress and quiz history independent from Linked List", () => {
    const arrayLessons = getOrderedLessons("array").map((lesson) => lesson.slug);
    const empty = derive([], { moduleSlug: "array" });
    const partial = derive(arrayLessons.slice(0, 3), {
      moduleSlug: "array",
      scores: [40, 80],
      lastLessonSlug: "contiguous-memory",
    });
    const completed = derive(arrayLessons, { moduleSlug: "array", scores: [90] });

    expect(empty).toMatchObject({ moduleSlug: "array", percentage: 0, status: "not-started" });
    expect(partial).toMatchObject({
      moduleSlug: "array",
      completedLessonCount: 3,
      totalLessonCount: 12,
      percentage: 25,
      bestQuizScore: 80,
      quizAttemptCount: 2,
      lastLessonSlug: "contiguous-memory",
    });
    expect(completed).toMatchObject({ percentage: 100, status: "completed" });

    const linkedList = derive(["node"], { scores: [70] });
    expect(linkedList).toMatchObject({
      moduleSlug: "linked-list",
      completedLessonCount: 1,
      totalLessonCount: 18,
      bestQuizScore: 70,
      quizAttemptCount: 1,
    });
  });
});
