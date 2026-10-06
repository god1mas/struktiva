import { describe, expect, it } from "vitest";
import { arrayQuiz } from "./quizzes/array";
import { getCanonicalQuiz, scoreQuiz, toPublicQuiz } from "@/features/quiz";
import { getModuleDefinition } from "./registry";

describe("Array learning content", () => {
  it("defines exactly twelve ordered, unique, progress-counting lessons", () => {
    const learningModule = getModuleDefinition("array");
    expect(learningModule.lessons).toHaveLength(12);
    expect(learningModule.lessons.map((lesson) => lesson.order)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
    expect(new Set(learningModule.lessons.map((lesson) => lesson.slug)).size).toBe(12);
    expect(learningModule.lessons.every((lesson) => lesson.countsTowardProgress)).toBe(true);
  });

  it("defines ten valid questions with four unique options each", () => {
    expect(arrayQuiz.questions).toHaveLength(10);
    expect(new Set(arrayQuiz.questions.map((question) => question.id)).size).toBe(10);
    for (const question of arrayQuiz.questions) {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(4);
      expect(question.options.some((option) => option.id === question.correctOptionId)).toBe(true);
    }
    expect(getCanonicalQuiz("array")).toBe(arrayQuiz);
  });

  it("keeps solutions out of public data and scores through generic infrastructure", () => {
    const publicJson = JSON.stringify(toPublicQuiz(arrayQuiz));
    expect(publicJson).not.toContain("correctOptionId");
    expect(publicJson).not.toContain("explanation");

    const answers = arrayQuiz.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: question.correctOptionId,
    }));
    const result = scoreQuiz(arrayQuiz, answers);
    expect(result.score).toBe(100);
    expect(result.correctAnswers).toBe(10);
    expect(result.topicBreakdown.reduce((sum, topic) => sum + topic.totalQuestions, 0)).toBe(10);
  });
});
