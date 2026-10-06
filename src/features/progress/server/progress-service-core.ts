import {
  getLessonDefinition,
  getModuleDefinition,
  getRegisteredModules,
} from "@/content";
import type { PrismaClient } from "@/generated/prisma/client";
import { deriveModuleLearningProgress } from "../derive-progress";
import type { ModuleLearningProgress } from "../types";

export function createProgressService(database: PrismaClient) {
  async function startLesson(userId: string, moduleSlug: string, lessonSlug: string) {
    getLessonDefinition(moduleSlug, lessonSlug);
    await database.$transaction([
      database.lessonProgress.upsert({
        where: { userId_moduleSlug_lessonSlug: { userId, moduleSlug, lessonSlug } },
        create: { userId, moduleSlug, lessonSlug },
        update: {},
      }),
      database.moduleProgress.upsert({
        where: { userId_moduleSlug: { userId, moduleSlug } },
        create: { userId, moduleSlug, lastLessonSlug: lessonSlug },
        update: { lastLessonSlug: lessonSlug },
      }),
    ]);
  }

  async function completeLesson(userId: string, moduleSlug: string, lessonSlug: string) {
    const learningModule = getModuleDefinition(moduleSlug);
    getLessonDefinition(moduleSlug, lessonSlug);
    const progressLessonSlugs = learningModule.lessons
      .filter((lesson) => lesson.countsTowardProgress)
      .map((lesson) => lesson.slug);

    await database.$transaction(async (transaction) => {
      const now = new Date();
      const key = { userId_moduleSlug_lessonSlug: { userId, moduleSlug, lessonSlug } };
      const existingLesson = await transaction.lessonProgress.findUnique({ where: key });
      if (!existingLesson) {
        await transaction.lessonProgress.create({
          data: { userId, moduleSlug, lessonSlug, startedAt: now, completedAt: now },
        });
      } else if (existingLesson.completedAt === null) {
        await transaction.lessonProgress.update({ where: key, data: { completedAt: now } });
      }

      const completedCount = await transaction.lessonProgress.count({
        where: {
          userId,
          moduleSlug,
          lessonSlug: { in: progressLessonSlugs },
          completedAt: { not: null },
        },
      });
      const moduleKey = { userId_moduleSlug: { userId, moduleSlug } };
      const existingModule = await transaction.moduleProgress.findUnique({ where: moduleKey });
      const completedAt =
        completedCount === progressLessonSlugs.length
          ? (existingModule?.completedAt ?? now)
          : null;
      await transaction.moduleProgress.upsert({
        where: moduleKey,
        create: {
          userId,
          moduleSlug,
          lastLessonSlug: lessonSlug,
          startedAt: now,
          completedAt,
        },
        update: { lastLessonSlug: lessonSlug, completedAt },
      });
    });
  }

  async function getModuleLearningProgress(
    userId: string,
    moduleSlug: string,
  ): Promise<ModuleLearningProgress> {
    getModuleDefinition(moduleSlug);
    const [moduleProgress, lessonProgress, quizAttempts] = await Promise.all([
      database.moduleProgress.findUnique({
        where: { userId_moduleSlug: { userId, moduleSlug } },
        select: { lastLessonSlug: true },
      }),
      database.lessonProgress.findMany({
        where: { userId, moduleSlug },
        select: { lessonSlug: true, completedAt: true },
      }),
      database.quizAttempt.findMany({
        where: { userId, moduleSlug, submittedAt: { not: null } },
        select: { score: true },
      }),
    ]);
    return deriveModuleLearningProgress({
      moduleSlug,
      lessonProgress,
      lastLessonSlug: moduleProgress?.lastLessonSlug ?? null,
      quizAttempts,
    });
  }

  async function getUserLearningProgress(userId: string) {
    return Promise.all(
      getRegisteredModules().map((module) =>
        getModuleLearningProgress(userId, module.slug),
      ),
    );
  }

  return { startLesson, completeLesson, getModuleLearningProgress, getUserLearningProgress };
}
