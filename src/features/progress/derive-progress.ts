import { getModuleDefinition } from "@/content";
import type { ModuleLearningProgress, ModuleProgressInput } from "./types";

export function deriveModuleLearningProgress(
  input: ModuleProgressInput,
): ModuleLearningProgress {
  const learningModule = getModuleDefinition(input.moduleSlug);
  const progressLessons = learningModule.lessons.filter(
    (lesson) => lesson.countsTowardProgress,
  );
  const registeredSlugs = new Set(progressLessons.map((lesson) => lesson.slug));
  const started = new Set(
    input.lessonProgress
      .filter((record) => registeredSlugs.has(record.lessonSlug))
      .map((record) => record.lessonSlug),
  );
  const completed = new Set(
    input.lessonProgress
      .filter(
        (record) =>
          record.completedAt !== null && registeredSlugs.has(record.lessonSlug),
      )
      .map((record) => record.lessonSlug),
  );
  const totalLessonCount = progressLessons.length;
  const completedLessonCount = completed.size;
  const percentage =
    totalLessonCount === 0
      ? 0
      : Math.round((completedLessonCount / totalLessonCount) * 100);
  const status =
    totalLessonCount > 0 && completedLessonCount === totalLessonCount
      ? "completed"
      : started.size > 0 || input.quizAttempts.length > 0
        ? "in-progress"
        : "not-started";
  const lastLesson = learningModule.lessons.find(
    (lesson) => lesson.slug === input.lastLessonSlug,
  );
  const scores = input.quizAttempts.map((attempt) => attempt.score);

  return {
    moduleSlug: learningModule.slug,
    moduleTitle: learningModule.title,
    status,
    completedLessonCount,
    totalLessonCount,
    percentage,
    lastLessonSlug: lastLesson?.slug ?? null,
    lastLessonTitle: lastLesson?.title ?? null,
    bestQuizScore: scores.length > 0 ? Math.max(...scores) : null,
    quizAttemptCount: input.quizAttempts.length,
  };
}
