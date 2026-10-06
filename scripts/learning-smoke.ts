import "dotenv/config";

import { arrayQuiz } from "../src/content/quizzes/array";
import { linkedListQuiz } from "../src/content/quizzes/linked-list";
import { stackQuiz } from "../src/content/quizzes/stack";
import { createProgressService } from "../src/features/progress/server/progress-service-core";
import { createQuizPersistence } from "../src/features/quiz/server/quiz-persistence-core";
import { createQuizSubmissionHandler } from "../src/features/quiz/server/submission-handler";
import type { CanonicalQuiz } from "../src/features/quiz/types";
import { prisma } from "../src/lib/prisma";

const fixtureEmail = "phase7-smoke@struktiva.local";
const fixtureUserId = "phase7-learning-smoke-user";
const progressService = createProgressService(prisma);
const persistAttempt = createQuizPersistence(prisma);

function quizRequest(quiz: CanonicalQuiz) {
  return new Request(`http://localhost/api/learning/quiz/${quiz.moduleSlug}/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      answers: quiz.questions.map((question) => ({
        questionId: question.id,
        selectedOptionId: question.correctOptionId,
      })),
    }),
  });
}

async function cleanupFixture() {
  await prisma.user.deleteMany({ where: { email: fixtureEmail } });
}

async function main() {
  await cleanupFixture();
  await prisma.user.create({
    data: {
      id: fixtureUserId,
      name: "Phase 7 Smoke Fixture",
      email: fixtureEmail,
      emailVerified: true,
    },
  });

  await progressService.startLesson(fixtureUserId, "linked-list", "node");
  await progressService.completeLesson(fixtureUserId, "linked-list", "node");
  await progressService.completeLesson(fixtureUserId, "linked-list", "node");
  const lessonCount = await prisma.lessonProgress.count({
    where: { userId: fixtureUserId, moduleSlug: "linked-list", lessonSlug: "node" },
  });
  if (lessonCount !== 1) throw new Error("Lesson completion was not idempotent.");
  const moduleCount = await prisma.moduleProgress.count({
    where: { userId: fixtureUserId, moduleSlug: "linked-list" },
  });
  if (moduleCount !== 1) throw new Error("Module progress was not created exactly once.");

  await progressService.startLesson(fixtureUserId, "array", "index-and-element");
  await progressService.completeLesson(fixtureUserId, "array", "index-and-element");
  const arrayLessonCount = await prisma.lessonProgress.count({
    where: { userId: fixtureUserId, moduleSlug: "array", lessonSlug: "index-and-element" },
  });
  if (arrayLessonCount !== 1) throw new Error("Array lesson progress was not persisted independently.");

  await progressService.startLesson(fixtureUserId, "stack", "lifo-principle");
  await progressService.completeLesson(fixtureUserId, "stack", "lifo-principle");
  const stackLessonCount = await prisma.lessonProgress.count({
    where: { userId: fixtureUserId, moduleSlug: "stack", lessonSlug: "lifo-principle" },
  });
  if (stackLessonCount !== 1) throw new Error("Stack lesson progress was not persisted independently.");

  const guestHandler = createQuizSubmissionHandler({
    getAuthenticatedUserId: async () => null,
    persistAttempt,
  });
  const guestResponse = await guestHandler(quizRequest(arrayQuiz), "array");
  const guestAttemptCount = await prisma.quizAttempt.count({
    where: { userId: fixtureUserId },
  });
  if (!guestResponse.ok || guestAttemptCount !== 0) {
    throw new Error("Guest submission unexpectedly persisted quiz data.");
  }

  const authenticatedHandler = createQuizSubmissionHandler({
    getAuthenticatedUserId: async () => fixtureUserId,
    persistAttempt,
  });
  const authenticatedResponse = await authenticatedHandler(quizRequest(linkedListQuiz), "linked-list");
  if (!authenticatedResponse.ok) throw new Error("Authenticated quiz submission failed.");
  const retakeResponse = await authenticatedHandler(quizRequest(linkedListQuiz), "linked-list");
  if (!retakeResponse.ok) throw new Error("Authenticated quiz retake failed.");
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: fixtureUserId, moduleSlug: "linked-list" },
    include: { answers: true },
  });
  if (
    attempts.length !== 2 ||
    attempts.some((attempt) => attempt.answers.length !== linkedListQuiz.questions.length)
  ) {
    throw new Error("Quiz retake did not preserve two complete attempts.");
  }
  const arrayResponse = await authenticatedHandler(quizRequest(arrayQuiz), "array");
  if (!arrayResponse.ok) throw new Error("Authenticated Array quiz submission failed.");
  const arrayAttempts = await prisma.quizAttempt.findMany({
    where: { userId: fixtureUserId, moduleSlug: "array" },
    include: { answers: true },
  });
  if (
    arrayAttempts.length !== 1 ||
    arrayAttempts[0]!.answers.length !== arrayQuiz.questions.length
  ) {
    throw new Error("Array quiz history was not persisted independently.");
  }
  const stackResponse = await authenticatedHandler(quizRequest(stackQuiz), "stack");
  if (!stackResponse.ok) throw new Error("Authenticated Stack quiz submission failed.");
  const stackAttempts = await prisma.quizAttempt.findMany({
    where: { userId: fixtureUserId, moduleSlug: "stack" },
    include: { answers: true },
  });
  if (
    stackAttempts.length !== 1 ||
    stackAttempts[0]!.answers.length !== stackQuiz.questions.length
  ) {
    throw new Error("Stack quiz history was not persisted independently.");
  }
  const summary = await progressService.getModuleLearningProgress(
    fixtureUserId,
    "linked-list",
  );
  if (summary.bestQuizScore !== 100 || summary.quizAttemptCount !== 2) {
    throw new Error("Derived quiz summary is incorrect.");
  }
  const arraySummary = await progressService.getModuleLearningProgress(
    fixtureUserId,
    "array",
  );
  if (
    arraySummary.completedLessonCount !== 1 ||
    arraySummary.totalLessonCount !== 12 ||
    arraySummary.bestQuizScore !== 100 ||
    arraySummary.quizAttemptCount !== 1
  ) {
    throw new Error("Derived Array progress or quiz summary is incorrect.");
  }
  const stackSummary = await progressService.getModuleLearningProgress(
    fixtureUserId,
    "stack",
  );
  if (
    stackSummary.completedLessonCount !== 1 ||
    stackSummary.totalLessonCount !== 11 ||
    stackSummary.bestQuizScore !== 100 ||
    stackSummary.quizAttemptCount !== 1
  ) {
    throw new Error("Derived Stack progress or quiz summary is incorrect.");
  }
  console.log("Learning progress and quiz smoke check passed.");
}

main()
  .catch((error: unknown) => {
    console.error("Learning progress and quiz smoke check failed.");
    console.error(error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanupFixture();
    const remaining = await prisma.user.count({ where: { email: fixtureEmail } });
    if (remaining !== 0) {
      console.error("Learning smoke fixture cleanup failed.");
      process.exitCode = 1;
    }
    await prisma.$disconnect();
  });
