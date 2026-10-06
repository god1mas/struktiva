import { describe, expect, it } from "vitest";
import { getCanonicalQuiz, scoreQuiz, toPublicQuiz } from "@/features/quiz";
import { stackQuiz } from "./quizzes/stack";
import { getModuleDefinition } from "./registry";

describe("Stack learning content", () => {
  it("defines exactly eleven ordered, unique, progress-counting lessons", () => {
    const learningModule = getModuleDefinition("stack");
    expect(learningModule.lessons).toHaveLength(11);
    expect(learningModule.lessons.map((lesson) => lesson.slug)).toEqual([
      "what-is-stack", "lifo-principle", "top", "push", "pop", "peek",
      "empty-and-full", "overflow-and-underflow", "time-complexity", "practice", "quiz",
    ]);
    expect(learningModule.lessons.map((lesson) => lesson.order)).toEqual(
      Array.from({ length: 11 }, (_, index) => index + 1),
    );
    expect(learningModule.lessons.every((lesson) => lesson.countsTowardProgress)).toBe(true);
  });

  it("defines ten valid Indonesian questions with four unique options", () => {
    expect(stackQuiz.questions).toHaveLength(10);
    expect(new Set(stackQuiz.questions.map((question) => question.id)).size).toBe(10);
    expect(stackQuiz.questions.map((question) => question.topicSlug)).toEqual([
      "concept", "lifo", "top", "push", "pop", "peek", "is-empty", "is-full",
      "overflow-underflow", "complexity",
    ]);
    for (const question of stackQuiz.questions) {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(4);
      expect(question.options.some((option) => option.id === question.correctOptionId)).toBe(true);
    }
    expect(getCanonicalQuiz("stack")).toBe(stackQuiz);
  });

  it("keeps solutions private and scores with generic infrastructure", () => {
    const publicJson = JSON.stringify(toPublicQuiz(stackQuiz));
    expect(publicJson).not.toContain("correctOptionId");
    expect(publicJson).not.toContain("explanation");
    const answers = stackQuiz.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: question.correctOptionId,
    }));
    expect(scoreQuiz(stackQuiz, answers)).toMatchObject({ score: 100, correctAnswers: 10 });
  });
});
