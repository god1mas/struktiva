import { ContentNotFoundError } from "@/content";
import { getCanonicalQuiz } from "../registry";
import { scoreQuiz } from "../scoring";
import { QuizSubmissionError, validateQuizSubmission } from "../submission";
import type { QuizScoreResult, QuizSubmissionResponse } from "../types";

export interface QuizSubmissionDependencies {
  readonly getAuthenticatedUserId: (headers: Headers) => Promise<string | null>;
  readonly persistAttempt: (
    userId: string,
    moduleSlug: string,
    result: QuizScoreResult,
  ) => Promise<unknown>;
}

export function createQuizSubmissionHandler(
  dependencies: QuizSubmissionDependencies,
) {
  return async function handleQuizSubmission(
    request: Request,
    moduleSlug: string,
  ): Promise<Response> {
    try {
      const quiz = getCanonicalQuiz(moduleSlug);
      const payload: unknown = await request.json();
      const answers = validateQuizSubmission(quiz, payload);
      const result = scoreQuiz(quiz, answers);
      const userId = await dependencies.getAuthenticatedUserId(request.headers);
      const saved = userId !== null;
      if (userId) {
        await dependencies.persistAttempt(userId, moduleSlug, result);
      }
      const response: QuizSubmissionResponse = { saved, result };
      return Response.json(response);
    } catch (error) {
      if (error instanceof ContentNotFoundError) {
        return Response.json({ error: "Quiz tidak ditemukan." }, { status: 404 });
      }
      if (error instanceof QuizSubmissionError || error instanceof SyntaxError) {
        return Response.json(
          { error: error instanceof QuizSubmissionError ? error.message : "Payload quiz tidak valid." },
          { status: 400 },
        );
      }
      console.error("Quiz submission failed.");
      return Response.json(
        { error: "Quiz belum dapat diproses. Silakan coba lagi." },
        { status: 500 },
      );
    }
  };
}
