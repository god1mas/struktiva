import { describe, expect, it } from "vitest";
import { getOrderedLessons } from "@/content";
import { deriveModuleLearningProgress } from "./derive-progress";

function derive(
  completedSlugs: readonly string[],
  options: {
    readonly startedSlugs?: readonly string[];
    readonly scores?: readonly number[];
    readonly lastLessonSlug?: string | null;
  } = {},
) {
  return deriveModuleLearningProgress({
    moduleSlug: "linked-list",
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
});
