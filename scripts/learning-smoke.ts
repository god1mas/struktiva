import "dotenv/config";

import { linkedListQuiz } from "../src/content/quizzes/linked-list";
import { createProgressService } from "../src/features/progress/server/progress-service-core";
import { createQuizPersistence } from "../src/features/quiz/server/quiz-persistence-core";
import { createQuizSubmissionHandler } from "../src/features/quiz/server/submission-handler";
import { prisma } from "../src/lib/prisma";

const fixtureEmail = "phase7-smoke@struktiva.local";
const fixtureUserId = "phase7-learning-smoke-user";
const progressService = createProgressService(prisma);
const persistAttempt = createQuizPersistence(prisma);

function quizRequest() {
  return new Request("http://localhost/api/learning/quiz/linked-list/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      answers: linkedListQuiz.questions.map((question) => ({
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

  const guestHandler = createQuizSubmissionHandler({
    getAuthenticatedUserId: async () => null,
    persistAttempt,
  });
  const guestResponse = await guestHandler(quizRequest(), "linked-list");
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
  const authenticatedResponse = await authenticatedHandler(quizRequest(), "linked-list");
  if (!authenticatedResponse.ok) throw new Error("Authenticated quiz submission failed.");
  const retakeResponse = await authenticatedHandler(quizRequest(), "linked-list");
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
  const summary = await progressService.getModuleLearningProgress(
    fixtureUserId,
    "linked-list",
  );
  if (summary.bestQuizScore !== 100 || summary.quizAttemptCount !== 2) {
    throw new Error("Derived quiz summary is incorrect.");
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
