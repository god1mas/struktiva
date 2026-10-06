import { describe, expect, it, vi } from "vitest";
import { linkedListQuiz } from "@/content/quizzes/linked-list";
import { createQuizSubmissionHandler } from "./submission-handler";

function payload(extra: Record<string, unknown> = {}) {
  return {
    answers: linkedListQuiz.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: question.correctOptionId,
    })),
    ...extra,
  };
}

function request(body: unknown) {
  return new Request("http://localhost/api/learning/quiz/linked-list/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("quiz submission server boundary", () => {
  it("grades guests without writing an attempt", async () => {
    const persistAttempt = vi.fn();
    const handler = createQuizSubmissionHandler({
      getAuthenticatedUserId: async () => null,
      persistAttempt,
    });

    const response = await handler(request(payload()), "linked-list");
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.saved).toBe(false);
    expect(result.result.score).toBe(100);
    expect(persistAttempt).not.toHaveBeenCalled();
  });

  it("persists using only the server-resolved authenticated user", async () => {
    const persistAttempt = vi.fn(async () => "attempt-id");
    const handler = createQuizSubmissionHandler({
      getAuthenticatedUserId: async () => "server-user-a",
      persistAttempt,
    });

    const response = await handler(request(payload()), "linked-list");
    expect(response.status).toBe(200);
    expect(persistAttempt).toHaveBeenCalledWith(
      "server-user-a",
      "linked-list",
      expect.objectContaining({ score: 100 }),
    );
  });

  it("rejects attempts to supply userId or score from the client", async () => {
    const persistAttempt = vi.fn();
    const handler = createQuizSubmissionHandler({
      getAuthenticatedUserId: async () => "server-user-a",
      persistAttempt,
    });

    const response = await handler(
      request(payload({ userId: "server-user-b", score: 100 })),
      "linked-list",
    );
    expect(response.status).toBe(400);
    expect(persistAttempt).not.toHaveBeenCalled();
  });

  it("returns a safe response for unknown modules", async () => {
    const handler = createQuizSubmissionHandler({
      getAuthenticatedUserId: async () => null,
      persistAttempt: vi.fn(),
    });
    const response = await handler(request(payload()), "unknown");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Quiz tidak ditemukan." });
  });
});
