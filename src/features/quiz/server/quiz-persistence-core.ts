import type { PrismaClient } from "@/generated/prisma/client";
import type { QuizScoreResult } from "../types";

export function createQuizPersistence(database: PrismaClient) {
  return async function persistQuizAttempt(
    userId: string,
    moduleSlug: string,
    result: QuizScoreResult,
    startedAt: Date = new Date(),
  ): Promise<string> {
    return database.$transaction(async (transaction) => {
      const attempt = await transaction.quizAttempt.create({
        data: {
          userId,
          moduleSlug,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          startedAt,
          submittedAt: new Date(),
        },
        select: { id: true },
      });
      await transaction.quizAnswer.createMany({
        data: result.questionResults.map((question) => ({
          attemptId: attempt.id,
          questionId: question.questionId,
          topicSlug: question.topicSlug,
          selectedOptionId: question.selectedOption.id,
          isCorrect: question.isCorrect,
        })),
      });
      return attempt.id;
    });
  };
}
