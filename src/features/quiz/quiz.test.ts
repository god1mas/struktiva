import { describe, expect, it } from "vitest";
import { linkedListQuiz } from "@/content/quizzes/linked-list";
import type { CanonicalQuiz, SubmittedAnswer } from "./types";
import {
  defineQuiz,
  getCanonicalQuiz,
  scoreQuiz,
  toPublicQuiz,
  validateQuizSubmission,
} from "./index";

function correctAnswers(): SubmittedAnswer[] {
  return linkedListQuiz.questions.map((question) => ({
    questionId: question.id,
    selectedOptionId: question.correctOptionId,
  }));
}

function wrongAnswers(): SubmittedAnswer[] {
  return linkedListQuiz.questions.map((question) => ({
    questionId: question.id,
    selectedOptionId: question.options.find(
      (option) => option.id !== question.correctOptionId,
    )!.id,
  }));
}

describe("Linked List quiz definition", () => {
  it("contains ten unique questions with four unique options and one valid answer", () => {
    expect(linkedListQuiz.questions).toHaveLength(10);
    const ids = linkedListQuiz.questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const question of linkedListQuiz.questions) {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(4);
      expect(
        question.options.filter((option) => option.id === question.correctOptionId),
      ).toHaveLength(1);
    }
  });

  it("rejects malformed canonical definitions", () => {
    const malformed = {
      moduleSlug: "bad-quiz",
      title: "Bad",
      questions: [
        {
          id: "question-one",
          topicSlug: "topic",
          prompt: "Prompt",
          options: [
            { id: "same", label: "A" },
            { id: "same", label: "B" },
            { id: "third", label: "C" },
          ],
          correctOptionId: "missing",
          explanation: "Explanation",
        },
      ],
    };

    expect(() => defineQuiz(malformed as unknown as CanonicalQuiz)).toThrow();
  });

  it("does not serialize answer keys or explanations into the public shape", () => {
    const serialized = JSON.stringify(toPublicQuiz(linkedListQuiz));

    expect(serialized).not.toContain("correctOptionId");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain(linkedListQuiz.questions[0]!.explanation);
  });

  it("rejects an unknown quiz module", () => {
    expect(() => getCanonicalQuiz("unknown-module")).toThrow("tidak ditemukan");
  });
});

describe("quiz submission validation", () => {
  it("accepts exactly one valid answer for every required question", () => {
    expect(
      validateQuizSubmission(linkedListQuiz, { answers: correctAnswers() }),
    ).toHaveLength(10);
  });

  it("rejects missing, extra, duplicate, and invalid answers", () => {
    const correct = correctAnswers();
    expect(() =>
      validateQuizSubmission(linkedListQuiz, { answers: correct.slice(0, 9) }),
    ).toThrow(/wajib dijawab/);
    expect(() =>
      validateQuizSubmission(linkedListQuiz, {
        answers: [
          ...correct,
          { questionId: "unknown-question", selectedOptionId: "unknown-option" },
        ],
      }),
    ).toThrow();
    expect(() =>
      validateQuizSubmission(linkedListQuiz, {
        answers: [...correct.slice(0, 9), correct[0]],
      }),
    ).toThrow(/satu kali/);
    expect(() =>
      validateQuizSubmission(linkedListQuiz, {
        answers: correct.map((answer, index) =>
          index === 0 ? { ...answer, selectedOptionId: "tampered-option" } : answer,
        ),
      }),
    ).toThrow(/tidak valid/);
  });

  it("rejects client-controlled user or score fields", () => {
    expect(() =>
      validateQuizSubmission(linkedListQuiz, {
        userId: "attacker-selected-user",
        score: 100,
        answers: correctAnswers(),
      }),
    ).toThrow("Payload quiz tidak valid");
  });
});

describe("pure quiz scoring", () => {
  it("scores perfect, zero, and partial submissions deterministically", () => {
    const correct = correctAnswers();
    expect(scoreQuiz(linkedListQuiz, correct).score).toBe(100);
    expect(scoreQuiz(linkedListQuiz, wrongAnswers()).score).toBe(0);
    const partial = [...correct.slice(0, 5), ...wrongAnswers().slice(5)];
    const result = scoreQuiz(linkedListQuiz, partial);
    expect(result.score).toBe(50);
    expect(result.correctAnswers).toBe(5);
    expect(result.topicBreakdown.reduce((sum, topic) => sum + topic.totalQuestions, 0)).toBe(10);
  });

  it("keeps retry scoring independent", () => {
    const first = scoreQuiz(linkedListQuiz, wrongAnswers());
    const retry = scoreQuiz(linkedListQuiz, correctAnswers());

    expect(first.score).toBe(0);
    expect(retry.score).toBe(100);
    expect(first.questionResults).not.toBe(retry.questionResults);
  });
});
